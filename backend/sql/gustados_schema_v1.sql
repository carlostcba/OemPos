-- Crear base de datos
CREATE DATABASE gustados;
GO

USE gustados;
GO

-- Tabla de usuarios (simplificada)
CREATE TABLE Users (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  username NVARCHAR(50) NOT NULL UNIQUE,
  password_hash NVARCHAR(255) NOT NULL,
  role NVARCHAR(20) NOT NULL DEFAULT 'vendedor',
  created_at DATETIME DEFAULT GETDATE()
);
GO

-- Tabla de categorías
CREATE TABLE Categories (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  name NVARCHAR(100) NOT NULL UNIQUE
);
GO

-- Tabla de subcategorías
CREATE TABLE Subcategories (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  name NVARCHAR(100) NOT NULL,
  category_id UNIQUEIDENTIFIER,
  FOREIGN KEY (category_id) REFERENCES Categories(id)
);
GO

-- Tabla de imágenes
CREATE TABLE ProductImages (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  image VARBINARY(MAX) NOT NULL,
  mime_type NVARCHAR(50) NOT NULL,
  uploaded_at DATETIME DEFAULT GETDATE()
);
GO

-- Tabla de productos
CREATE TABLE Products (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  name NVARCHAR(100) NOT NULL,
  plu_code NVARCHAR(4) UNIQUE, -- Código PLU corto
  price DECIMAL(10,2) NOT NULL,
  is_weighable BIT DEFAULT 0,
  unit_label NVARCHAR(20) DEFAULT 'unidad',
  stock DECIMAL(10,2) DEFAULT 0,
  track_stock BIT DEFAULT 1, -- Controla si se descuenta o no
  allow_discount BIT DEFAULT 1,
  is_active BIT DEFAULT 1,
  description NVARCHAR(255),
  created_by UNIQUEIDENTIFIER,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME,
  category_id UNIQUEIDENTIFIER,
  subcategory_id UNIQUEIDENTIFIER,
  product_image_id UNIQUEIDENTIFIER,
  FOREIGN KEY (created_by) REFERENCES Users(id),
  FOREIGN KEY (category_id) REFERENCES Categories(id),
  FOREIGN KEY (subcategory_id) REFERENCES Subcategories(id),
  FOREIGN KEY (product_image_id) REFERENCES ProductImages(id)
);
GO
