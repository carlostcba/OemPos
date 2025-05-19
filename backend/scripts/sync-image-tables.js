const { sequelize, Image, ImageLink, ImageBinary } = require('../models');

async function addOrUpdateColumnComment(table, column, comment) {
  const safeComment = comment.replace(/'/g, "''");
  const sql = `
    DECLARE @major_id INT = OBJECT_ID('${table}');
    DECLARE @minor_id INT = COLUMNPROPERTY(@major_id, '${column}', 'ColumnId');
    DECLARE @prop_id INT;

    SELECT @prop_id = ep.major_id
    FROM sys.extended_properties ep
    WHERE ep.major_id = @major_id
      AND ep.minor_id = @minor_id
      AND ep.name = 'MS_Description';

    IF @prop_id IS NOT NULL
    BEGIN
      EXEC sp_updateextendedproperty 
        @name = N'MS_Description',
        @value = N'${safeComment}',
        @level0type = N'Schema', @level0name = N'dbo',
        @level1type = N'Table',  @level1name = '${table}',
        @level2type = N'Column', @level2name = '${column}';
    END
    ELSE
    BEGIN
      BEGIN TRY
        EXEC sp_addextendedproperty 
          @name = N'MS_Description',
          @value = N'${safeComment}',
          @level0type = N'Schema', @level0name = N'dbo',
          @level1type = N'Table',  @level1name = '${table}',
          @level2type = N'Column', @level2name = '${column}';
      END TRY
      BEGIN CATCH
      END CATCH
    END
  `;
  return sequelize.query(sql);
}

async function syncImageTables() {
  try {
    console.log('🔄 Iniciando sincronización de tablas de imágenes...');

    const [tablesResult] = await sequelize.query(`
      SELECT TABLE_NAME as tableName
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
    `);

    const lowerCaseTables = tablesResult.map(t => t.tableName.toLowerCase());
    const imageTableExists = lowerCaseTables.includes('images');
    const imageLinkTableExists = lowerCaseTables.includes('image_links');
    const imageBinaryTableExists = lowerCaseTables.includes('image_binaries');

    console.log('📄 Estado inicial de tablas:');
    console.log('- images:', imageTableExists);
    console.log('- image_links:', imageLinkTableExists);
    console.log('- image_binaries:', imageBinaryTableExists);

    if (!imageBinaryTableExists) {
      console.log('🧱 Creando tabla image_binaries...');
      await sequelize.query(`
        CREATE TABLE image_binaries (
          id CHAR(36) PRIMARY KEY NOT NULL,
          data VARBINARY(MAX) NOT NULL,
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE()
        );
      `);
    } else {
      await ImageBinary.sync({ alter: true });
    }

    console.log('✅ Modelo ImageBinary sincronizado');

    if (imageTableExists) {
      await sequelize.query(`ALTER TABLE [images] ALTER COLUMN [path] NVARCHAR(255) NULL;`);
      await addOrUpdateColumnComment('images', 'path', 'Ruta relativa en disco');

      await sequelize.query(`ALTER TABLE [images] ALTER COLUMN [url] NVARCHAR(500);`);
      await sequelize.query(`ALTER TABLE [images] ALTER COLUMN [mime_type] NVARCHAR(100);`);
      await sequelize.query(`ALTER TABLE [images] ALTER COLUMN [storage_type] VARCHAR(255) NULL;`);

      await addOrUpdateColumnComment('images', 'url', 'URL para acceso directo (CDN/cloud)');
      await addOrUpdateColumnComment('images', 'reference_id', 'ID de referencia en servicio externo');
      await addOrUpdateColumnComment('images', 'filename', 'Nombre del archivo con extensión');
      await addOrUpdateColumnComment('images', 'original_name', 'Nombre original del archivo subido');
      await addOrUpdateColumnComment('images', 'size', 'Tamaño en bytes');
      await addOrUpdateColumnComment('images', 'storage_type', 'disk | database | cloud');
      await addOrUpdateColumnComment('images', 'metadata', 'Metadatos adicionales en formato JSON');

      const [checkConstraints] = await sequelize.query(`
        SELECT * FROM sys.check_constraints cc
        JOIN sys.objects o ON cc.parent_object_id = o.object_id
        WHERE o.name = 'images' AND cc.name LIKE '%storage_type%'
      `);

      if (checkConstraints.length === 0) {
        await sequelize.query(`
          ALTER TABLE images ADD CONSTRAINT CHK_images_storage_type 
          CHECK (storage_type IN ('database', 'disk', 'cloud'));
        `);
      }
    } else {
      console.log('🧱 Creando tabla images...');
      await sequelize.query(`
        CREATE TABLE images (
          id CHAR(36) PRIMARY KEY,
          path NVARCHAR(255),
          url NVARCHAR(500),
          reference_id NVARCHAR(255),
          filename NVARCHAR(255) NOT NULL,
          original_name NVARCHAR(255),
          mime_type NVARCHAR(100) NOT NULL,
          size INT,
          storage_type VARCHAR(20) NOT NULL,
          metadata NVARCHAR(MAX),
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE()
        );
        ALTER TABLE images ADD CONSTRAINT CHK_images_storage_type 
        CHECK (storage_type IN ('database', 'disk', 'cloud'));
        ALTER TABLE images ADD CONSTRAINT DF_images_storage_type DEFAULT 'disk' FOR storage_type;
      `);
    }

    console.log('✅ Tabla images lista');

    if (imageLinkTableExists) {
      const [foreignKeys] = await sequelize.query(`
        SELECT * FROM sys.foreign_keys fk
        JOIN sys.objects o ON fk.parent_object_id = o.object_id
        WHERE o.name = 'image_links'
      `);

      if (foreignKeys.length === 0) {
        await sequelize.query(`
          ALTER TABLE image_links
          ADD CONSTRAINT FK_image_links_images
          FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE;
        `);
      }
    } else {
      await sequelize.query(`
        CREATE TABLE image_links (
          id INT PRIMARY KEY IDENTITY(1,1),
          image_id CHAR(36) NOT NULL,
          owner_type NVARCHAR(50) NOT NULL,
          owner_id NVARCHAR(50) NOT NULL,
          tag NVARCHAR(50),
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE(),
          CONSTRAINT FK_image_links_images FOREIGN KEY (image_id)
          REFERENCES images(id) ON DELETE CASCADE
        );
      `);
    }

    console.log('✅ Tabla image_links lista');

    await Image.sync({ alter: true });
    await ImageLink.sync({ alter: true });
    await ImageBinary.sync({ alter: true });

    await sequelize.query(`
      ALTER TABLE images ALTER COLUMN storage_type NVARCHAR(20) NOT NULL;

      DECLARE @constraintName NVARCHAR(128);
      SELECT @constraintName = dc.name
      FROM sys.default_constraints dc
      JOIN sys.columns c ON c.default_object_id = dc.object_id
      JOIN sys.tables t ON c.object_id = t.object_id
      WHERE t.name = 'images' AND c.name = 'storage_type';

      IF @constraintName IS NOT NULL
      BEGIN
        EXEC('ALTER TABLE images DROP CONSTRAINT ' + @constraintName);
      END;

      ALTER TABLE images ADD CONSTRAINT DF_images_storage_type DEFAULT 'disk' FOR storage_type;
    `);

    console.log('✅ Sincronización completada correctamente');
    return true;
  } catch (err) {
    console.error('❌ Error en la sincronización:', err.message);
    return false;
  }
}

if (require.main === module) {
  syncImageTables()
    .then(success => process.exit(success ? 0 : 1))
    .catch(err => {
      console.error('❌ Error crítico:', err);
      process.exit(1);
    });
} else {
  module.exports = syncImageTables;
}