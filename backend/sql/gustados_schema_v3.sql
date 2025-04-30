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

-- Tabla de Ordenes
CREATE TABLE Orders (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

  -- Tipo de orden y código visible
  type VARCHAR(20) NOT NULL CHECK (type IN ('orden', 'pedido', 'delivery', 'salon')),
  order_code VARCHAR(10) NOT NULL, -- Ej: O001, P001...

  -- Cliente / mesa / dirección
  customer_name NVARCHAR(100),
  customer_phone NVARCHAR(30),
  customer_email NVARCHAR(100),
  table_number INT NULL, -- solo para 'salon'
  delivery_address NVARCHAR(255) NULL, -- solo para 'delivery'

  -- Fechas clave
  delivery_date DATETIME NULL, -- pedidos y delivery
  first_payment_date DATETIME NULL,
  last_payment_date DATETIME NULL,

  -- Totales
  total_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  total_cash_paid DECIMAL(10,2) DEFAULT 0,
  total_non_cash_paid DECIMAL(10,2) DEFAULT 0,

  -- Descuentos
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount_with_discount AS (total_amount - discount_amount) PERSISTED,

  -- Estado y forma de pago
  status NVARCHAR(30) DEFAULT 'pendiente',
  payment_method NVARCHAR(50), -- efectivo, tarjeta, mixto

  -- Relacionales
  created_by UNIQUEIDENTIFIER NOT NULL,
  cash_register_id UNIQUEIDENTIFIER NULL,
  coupon_code NVARCHAR(50) NULL,

  -- Metadatos
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME NULL,

  CONSTRAINT FK_orders_user FOREIGN KEY (created_by) REFERENCES Users(id)
);


--Tabla de Items de Ordenes
CREATE TABLE OrderItems (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  
  -- Relación con la orden
  order_id UNIQUEIDENTIFIER NOT NULL,
  product_id UNIQUEIDENTIFIER NOT NULL,

  -- Info desnormalizada del producto (para históricos)
  product_name NVARCHAR(100) NOT NULL,
  unit_label NVARCHAR(20) NOT NULL, -- unidad, kg, etc.

  -- Cantidad comprada (puede ser decimal para pesables)
  quantity DECIMAL(10, 3) NOT NULL,

  -- Precio original del producto en ese momento
  unit_price DECIMAL(10, 2) NOT NULL,

  -- Descuento aplicado a este ítem (en $)
  discount_applied DECIMAL(10, 2) DEFAULT 0,

  -- Precio final después del descuento (unitario * quantity - descuento)
  final_price DECIMAL(10, 2) NOT NULL,

  -- Código de cupón aplicado (si corresponde)
  coupon_code NVARCHAR(50) NULL,

  -- Timestamps
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME NULL,

  -- Foreign keys
  CONSTRAINT FK_orderitems_order FOREIGN KEY (order_id) REFERENCES Orders(id),
  CONSTRAINT FK_orderitems_product FOREIGN KEY (product_id) REFERENCES Products(id)
);



-- SQL para crear la tabla de cupones

-- Tabla de cupones
CREATE TABLE Coupons (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  code NVARCHAR(50) NOT NULL UNIQUE,
  description NVARCHAR(255),
  discount_type NVARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase_amount DECIMAL(10,2) DEFAULT 0,
  is_active BIT DEFAULT 1,
  one_time_use BIT DEFAULT 0,
  applies_to_all_products BIT DEFAULT 1,
  applies_to_category_id UNIQUEIDENTIFIER NULL,
  valid_from DATETIME NOT NULL DEFAULT GETDATE(),
  valid_to DATETIME NULL,
  usage_count INT DEFAULT 0,
  max_uses INT NULL,
  created_by UNIQUEIDENTIFIER NOT NULL,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME NULL,
  FOREIGN KEY (created_by) REFERENCES Users(id),
  FOREIGN KEY (applies_to_category_id) REFERENCES Categories(id)
);


CREATE TABLE Roles (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  name NVARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE Permissions (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  name NVARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE RolePermissions (
  role_id UNIQUEIDENTIFIER,
  permission_id UNIQUEIDENTIFIER,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES Roles(id),
  FOREIGN KEY (permission_id) REFERENCES Permissions(id)
);

ALTER TABLE Users
ADD role_id UNIQUEIDENTIFIER;

ALTER TABLE Users
ADD CONSTRAINT FK_users_role FOREIGN KEY (role_id) REFERENCES Roles(id);

-- ALTER TABLE Users DROP CONSTRAINT DF__Users__role__398D8EEE;
-- ALTER TABLE Users DROP COLUMN role;

