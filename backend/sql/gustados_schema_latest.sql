USE [master]
GO
/****** Object:  Database [gustados]    Script Date: 30/05/2025 0:08:20 ******/
CREATE DATABASE [gustados]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'gustados', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\gustados.mdf' , SIZE = 73728KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'gustados_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\gustados_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [gustados] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [gustados].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [gustados] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [gustados] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [gustados] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [gustados] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [gustados] SET ARITHABORT OFF 
GO
ALTER DATABASE [gustados] SET AUTO_CLOSE ON 
GO
ALTER DATABASE [gustados] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [gustados] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [gustados] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [gustados] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [gustados] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [gustados] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [gustados] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [gustados] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [gustados] SET  DISABLE_BROKER 
GO
ALTER DATABASE [gustados] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [gustados] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [gustados] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [gustados] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [gustados] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [gustados] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [gustados] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [gustados] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [gustados] SET  MULTI_USER 
GO
ALTER DATABASE [gustados] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [gustados] SET DB_CHAINING OFF 
GO
ALTER DATABASE [gustados] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [gustados] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [gustados] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [gustados] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [gustados] SET QUERY_STORE = ON
GO
ALTER DATABASE [gustados] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [gustados]
GO
/****** Object:  Table [dbo].[AuditLogs]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AuditLogs](
	[id] [uniqueidentifier] NOT NULL,
	[entity_type] [nvarchar](100) NOT NULL,
	[entity_id] [uniqueidentifier] NOT NULL,
	[action] [nvarchar](20) NOT NULL,
	[changes] [nvarchar](max) NULL,
	[previous_values] [nvarchar](max) NULL,
	[performed_by] [uniqueidentifier] NOT NULL,
	[performed_at] [datetime] NOT NULL,
	[ip_address] [nvarchar](45) NULL,
	[user_agent] [nvarchar](510) NULL,
	[source] [nvarchar](100) NULL,
	[notes] [nvarchar](max) NULL,
	[metadata] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CashRegisters]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CashRegisters](
	[id] [uniqueidentifier] NOT NULL,
	[opening_amount] [decimal](10, 2) NOT NULL,
	[closing_amount] [decimal](10, 2) NULL,
	[expected_amount] [decimal](10, 2) NULL,
	[difference_amount] [decimal](10, 2) NULL,
	[status] [varchar](10) NOT NULL,
	[opened_by] [uniqueidentifier] NOT NULL,
	[closed_by] [uniqueidentifier] NULL,
	[opening_notes] [nvarchar](max) NULL,
	[closing_notes] [nvarchar](max) NULL,
	[opened_at] [datetime] NULL,
	[closed_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CashTransactions]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CashTransactions](
	[id] [uniqueidentifier] NOT NULL,
	[cash_register_id] [uniqueidentifier] NOT NULL,
	[order_id] [uniqueidentifier] NULL,
	[type] [varchar](20) NOT NULL,
	[amount] [decimal](10, 2) NOT NULL,
	[payment_method] [varchar](50) NOT NULL,
	[description] [nvarchar](255) NULL,
	[reference] [varchar](100) NULL,
	[created_by] [uniqueidentifier] NOT NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Categories]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Categories](
	[id] [uniqueidentifier] NOT NULL,
	[name] [nvarchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Coupons]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Coupons](
	[id] [uniqueidentifier] NOT NULL,
	[code] [nvarchar](50) NOT NULL,
	[description] [nvarchar](255) NULL,
	[discount_type] [nvarchar](20) NOT NULL,
	[discount_value] [decimal](10, 2) NOT NULL,
	[min_purchase_amount] [decimal](10, 2) NULL,
	[is_active] [bit] NULL,
	[one_time_use] [bit] NULL,
	[applies_to_all_products] [bit] NULL,
	[applies_to_category_id] [uniqueidentifier] NULL,
	[valid_from] [datetime] NOT NULL,
	[valid_to] [datetime] NULL,
	[usage_count] [int] NULL,
	[max_uses] [int] NULL,
	[created_by] [uniqueidentifier] NOT NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[cash_payment_only] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[image_binaries]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[image_binaries](
	[id] [char](36) NOT NULL,
	[data] [varbinary](max) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[image_links]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[image_links](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[image_id] [char](36) NOT NULL,
	[owner_type] [nvarchar](50) NOT NULL,
	[owner_id] [char](36) NOT NULL,
	[tag] [nvarchar](50) NULL,
	[created_at] [datetimeoffset](7) NULL,
	[updated_at] [datetimeoffset](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[images]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[images](
	[id] [char](36) NOT NULL,
	[path] [nvarchar](255) NULL,
	[url] [nvarchar](500) NULL,
	[mime_type] [nvarchar](100) NOT NULL,
	[storage_type] [varchar](255) NOT NULL,
	[created_at] [datetimeoffset](7) NULL,
	[updated_at] [datetimeoffset](7) NULL,
	[reference_id] [nvarchar](255) NULL,
	[filename] [nvarchar](255) NOT NULL,
	[original_name] [nvarchar](255) NULL,
	[size] [int] NULL,
	[metadata] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[InventoryMovements]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InventoryMovements](
	[id] [uniqueidentifier] NOT NULL,
	[product_id] [uniqueidentifier] NOT NULL,
	[order_id] [uniqueidentifier] NULL,
	[movement_type] [varchar](20) NOT NULL,
	[quantity] [decimal](10, 3) NOT NULL,
	[previous_stock] [decimal](10, 3) NOT NULL,
	[new_stock] [decimal](10, 3) NOT NULL,
	[notes] [nvarchar](255) NULL,
	[created_by] [uniqueidentifier] NOT NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[OrderItems]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OrderItems](
	[id] [uniqueidentifier] NOT NULL,
	[order_id] [uniqueidentifier] NOT NULL,
	[product_id] [uniqueidentifier] NOT NULL,
	[product_name] [nvarchar](100) NOT NULL,
	[unit_label] [nvarchar](20) NOT NULL,
	[quantity] [decimal](10, 3) NOT NULL,
	[unit_price] [decimal](10, 2) NOT NULL,
	[discount_applied] [decimal](10, 2) NULL,
	[final_price] [decimal](10, 2) NOT NULL,
	[coupon_code] [nvarchar](50) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[OrderQueue]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OrderQueue](
	[id] [char](36) NOT NULL,
	[order_id] [char](36) NOT NULL,
	[priority] [int] NULL,
	[queue_position] [int] NOT NULL,
	[status] [nvarchar](255) NULL,
	[called_at] [datetimeoffset](7) NULL,
	[processed_at] [datetimeoffset](7) NULL,
	[created_at] [datetimeoffset](7) NULL,
	[updated_at] [datetimeoffset](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Orders]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Orders](
	[id] [uniqueidentifier] NOT NULL,
	[type] [varchar](20) NOT NULL,
	[order_code] [varchar](10) NOT NULL,
	[customer_name] [nvarchar](100) NULL,
	[customer_phone] [nvarchar](30) NULL,
	[customer_email] [nvarchar](100) NULL,
	[table_number] [int] NULL,
	[delivery_address] [nvarchar](255) NULL,
	[delivery_date] [datetime] NULL,
	[first_payment_date] [datetime] NULL,
	[last_payment_date] [datetime] NULL,
	[total_amount] [decimal](10, 2) NOT NULL,
	[deposit_amount] [decimal](10, 2) NULL,
	[total_cash_paid] [decimal](10, 2) NULL,
	[total_non_cash_paid] [decimal](10, 2) NULL,
	[discount_percentage] [decimal](5, 2) NULL,
	[discount_amount] [decimal](10, 2) NULL,
	[total_amount_with_discount]  AS ([total_amount]-[discount_amount]) PERSISTED,
	[status] [nvarchar](30) NULL,
	[payment_method] [nvarchar](50) NULL,
	[created_by] [uniqueidentifier] NOT NULL,
	[cash_register_id] [uniqueidentifier] NULL,
	[coupon_code] [nvarchar](50) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Permissions]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Permissions](
	[id] [uniqueidentifier] NOT NULL,
	[name] [nvarchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ProductImages]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductImages](
	[id] [uniqueidentifier] NOT NULL,
	[image] [varbinary](max) NOT NULL,
	[mime_type] [nvarchar](50) NOT NULL,
	[uploaded_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Products]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Products](
	[id] [uniqueidentifier] NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[plu_code] [nvarchar](4) NULL,
	[price] [decimal](10, 2) NOT NULL,
	[is_weighable] [bit] NULL,
	[unit_label] [nvarchar](20) NULL,
	[stock] [decimal](10, 2) NULL,
	[track_stock] [bit] NULL,
	[allow_discount] [bit] NULL,
	[is_active] [bit] NULL,
	[description] [nvarchar](255) NULL,
	[created_by] [uniqueidentifier] NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[category_id] [uniqueidentifier] NULL,
	[subcategory_id] [uniqueidentifier] NULL,
	[product_image_id] [uniqueidentifier] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[plu_code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Receipts]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Receipts](
	[id] [uniqueidentifier] NOT NULL,
	[order_id] [uniqueidentifier] NOT NULL,
	[receipt_number] [varchar](20) NOT NULL,
	[total_amount] [decimal](10, 2) NOT NULL,
	[payment_method] [varchar](50) NOT NULL,
	[is_partial] [bit] NULL,
	[customer_name] [nvarchar](100) NULL,
	[issued_by] [uniqueidentifier] NOT NULL,
	[issued_at] [datetime] NULL,
	[notes] [nvarchar](max) NULL,
	[is_voided] [bit] NULL,
	[voided_at] [datetime] NULL,
	[voided_by] [uniqueidentifier] NULL,
	[voided_reason] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[receipt_number] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RolePermissions]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RolePermissions](
	[role_id] [uniqueidentifier] NOT NULL,
	[permission_id] [uniqueidentifier] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[role_id] ASC,
	[permission_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Roles]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Roles](
	[id] [uniqueidentifier] NOT NULL,
	[name] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Subcategories]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Subcategories](
	[id] [uniqueidentifier] NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[category_id] [uniqueidentifier] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserRoles]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserRoles](
	[user_id] [uniqueidentifier] NOT NULL,
	[role_id] [uniqueidentifier] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[user_id] ASC,
	[role_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[id] [uniqueidentifier] NOT NULL,
	[username] [nvarchar](50) NOT NULL,
	[password_hash] [nvarchar](255) NOT NULL,
	[created_at] [datetime] NULL,
	[role_id] [uniqueidentifier] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [idx_images_storage_type]    Script Date: 30/05/2025 0:08:21 ******/
CREATE NONCLUSTERED INDEX [idx_images_storage_type] ON [dbo].[images]
(
	[storage_type] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[AuditLogs] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[AuditLogs] ADD  DEFAULT (getdate()) FOR [performed_at]
GO
ALTER TABLE [dbo].[AuditLogs] ADD  DEFAULT ('system') FOR [source]
GO
ALTER TABLE [dbo].[CashRegisters] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[CashRegisters] ADD  DEFAULT ((0)) FOR [opening_amount]
GO
ALTER TABLE [dbo].[CashRegisters] ADD  DEFAULT ('open') FOR [status]
GO
ALTER TABLE [dbo].[CashRegisters] ADD  DEFAULT (getdate()) FOR [opened_at]
GO
ALTER TABLE [dbo].[CashTransactions] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[CashTransactions] ADD  DEFAULT ('efectivo') FOR [payment_method]
GO
ALTER TABLE [dbo].[CashTransactions] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Categories] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[Coupons] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[Coupons] ADD  DEFAULT ((0)) FOR [min_purchase_amount]
GO
ALTER TABLE [dbo].[Coupons] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[Coupons] ADD  DEFAULT ((0)) FOR [one_time_use]
GO
ALTER TABLE [dbo].[Coupons] ADD  DEFAULT ((1)) FOR [applies_to_all_products]
GO
ALTER TABLE [dbo].[Coupons] ADD  DEFAULT (getdate()) FOR [valid_from]
GO
ALTER TABLE [dbo].[Coupons] ADD  DEFAULT ((0)) FOR [usage_count]
GO
ALTER TABLE [dbo].[Coupons] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Coupons] ADD  DEFAULT ((0)) FOR [cash_payment_only]
GO
ALTER TABLE [dbo].[image_links] ADD  DEFAULT ('default') FOR [tag]
GO
ALTER TABLE [dbo].[image_links] ADD  DEFAULT (sysdatetimeoffset()) FOR [created_at]
GO
ALTER TABLE [dbo].[image_links] ADD  DEFAULT (sysdatetimeoffset()) FOR [updated_at]
GO
ALTER TABLE [dbo].[images] ADD  DEFAULT ('disk') FOR [storage_type]
GO
ALTER TABLE [dbo].[images] ADD  DEFAULT (sysdatetimeoffset()) FOR [created_at]
GO
ALTER TABLE [dbo].[images] ADD  DEFAULT (sysdatetimeoffset()) FOR [updated_at]
GO
ALTER TABLE [dbo].[InventoryMovements] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[InventoryMovements] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[OrderItems] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[OrderItems] ADD  DEFAULT ((0)) FOR [discount_applied]
GO
ALTER TABLE [dbo].[OrderItems] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[OrderQueue] ADD  DEFAULT ((0)) FOR [priority]
GO
ALTER TABLE [dbo].[OrderQueue] ADD  DEFAULT (N'waiting') FOR [status]
GO
ALTER TABLE [dbo].[Orders] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[Orders] ADD  DEFAULT ((0)) FOR [deposit_amount]
GO
ALTER TABLE [dbo].[Orders] ADD  DEFAULT ((0)) FOR [total_cash_paid]
GO
ALTER TABLE [dbo].[Orders] ADD  DEFAULT ((0)) FOR [total_non_cash_paid]
GO
ALTER TABLE [dbo].[Orders] ADD  DEFAULT ((0)) FOR [discount_percentage]
GO
ALTER TABLE [dbo].[Orders] ADD  DEFAULT ((0)) FOR [discount_amount]
GO
ALTER TABLE [dbo].[Orders] ADD  DEFAULT ('pendiente') FOR [status]
GO
ALTER TABLE [dbo].[Orders] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Permissions] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[ProductImages] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[ProductImages] ADD  DEFAULT (getdate()) FOR [uploaded_at]
GO
ALTER TABLE [dbo].[Products] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[Products] ADD  DEFAULT ((0)) FOR [is_weighable]
GO
ALTER TABLE [dbo].[Products] ADD  DEFAULT ('unidad') FOR [unit_label]
GO
ALTER TABLE [dbo].[Products] ADD  DEFAULT ((0)) FOR [stock]
GO
ALTER TABLE [dbo].[Products] ADD  DEFAULT ((1)) FOR [track_stock]
GO
ALTER TABLE [dbo].[Products] ADD  DEFAULT ((1)) FOR [allow_discount]
GO
ALTER TABLE [dbo].[Products] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[Products] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Receipts] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[Receipts] ADD  DEFAULT ((0)) FOR [is_partial]
GO
ALTER TABLE [dbo].[Receipts] ADD  DEFAULT (getdate()) FOR [issued_at]
GO
ALTER TABLE [dbo].[Receipts] ADD  DEFAULT ((0)) FOR [is_voided]
GO
ALTER TABLE [dbo].[Roles] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[Subcategories] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[AuditLogs]  WITH CHECK ADD  CONSTRAINT [FK_AuditLogs_Users] FOREIGN KEY([performed_by])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[AuditLogs] CHECK CONSTRAINT [FK_AuditLogs_Users]
GO
ALTER TABLE [dbo].[CashRegisters]  WITH CHECK ADD FOREIGN KEY([closed_by])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[CashRegisters]  WITH CHECK ADD FOREIGN KEY([opened_by])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[CashTransactions]  WITH CHECK ADD FOREIGN KEY([cash_register_id])
REFERENCES [dbo].[CashRegisters] ([id])
GO
ALTER TABLE [dbo].[CashTransactions]  WITH CHECK ADD FOREIGN KEY([created_by])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[CashTransactions]  WITH CHECK ADD FOREIGN KEY([order_id])
REFERENCES [dbo].[Orders] ([id])
GO
ALTER TABLE [dbo].[Coupons]  WITH CHECK ADD FOREIGN KEY([applies_to_category_id])
REFERENCES [dbo].[Categories] ([id])
GO
ALTER TABLE [dbo].[Coupons]  WITH CHECK ADD FOREIGN KEY([created_by])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[image_binaries]  WITH CHECK ADD  CONSTRAINT [FK_image_binaries_images] FOREIGN KEY([id])
REFERENCES [dbo].[images] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[image_binaries] CHECK CONSTRAINT [FK_image_binaries_images]
GO
ALTER TABLE [dbo].[image_links]  WITH CHECK ADD  CONSTRAINT [FK_image_links_images] FOREIGN KEY([image_id])
REFERENCES [dbo].[images] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[image_links] CHECK CONSTRAINT [FK_image_links_images]
GO
ALTER TABLE [dbo].[InventoryMovements]  WITH CHECK ADD FOREIGN KEY([created_by])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[InventoryMovements]  WITH CHECK ADD FOREIGN KEY([order_id])
REFERENCES [dbo].[Orders] ([id])
GO
ALTER TABLE [dbo].[InventoryMovements]  WITH CHECK ADD FOREIGN KEY([product_id])
REFERENCES [dbo].[Products] ([id])
GO
ALTER TABLE [dbo].[OrderItems]  WITH CHECK ADD  CONSTRAINT [FK_orderitems_order] FOREIGN KEY([order_id])
REFERENCES [dbo].[Orders] ([id])
GO
ALTER TABLE [dbo].[OrderItems] CHECK CONSTRAINT [FK_orderitems_order]
GO
ALTER TABLE [dbo].[OrderItems]  WITH CHECK ADD  CONSTRAINT [FK_orderitems_product] FOREIGN KEY([product_id])
REFERENCES [dbo].[Products] ([id])
GO
ALTER TABLE [dbo].[OrderItems] CHECK CONSTRAINT [FK_orderitems_product]
GO
ALTER TABLE [dbo].[Orders]  WITH CHECK ADD  CONSTRAINT [FK_orders_user] FOREIGN KEY([created_by])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[Orders] CHECK CONSTRAINT [FK_orders_user]
GO
ALTER TABLE [dbo].[Products]  WITH CHECK ADD FOREIGN KEY([category_id])
REFERENCES [dbo].[Categories] ([id])
GO
ALTER TABLE [dbo].[Products]  WITH CHECK ADD FOREIGN KEY([created_by])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[Products]  WITH CHECK ADD FOREIGN KEY([product_image_id])
REFERENCES [dbo].[ProductImages] ([id])
GO
ALTER TABLE [dbo].[Products]  WITH CHECK ADD FOREIGN KEY([subcategory_id])
REFERENCES [dbo].[Subcategories] ([id])
GO
ALTER TABLE [dbo].[Receipts]  WITH CHECK ADD FOREIGN KEY([issued_by])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[Receipts]  WITH CHECK ADD FOREIGN KEY([order_id])
REFERENCES [dbo].[Orders] ([id])
GO
ALTER TABLE [dbo].[Receipts]  WITH CHECK ADD FOREIGN KEY([voided_by])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[RolePermissions]  WITH CHECK ADD FOREIGN KEY([permission_id])
REFERENCES [dbo].[Permissions] ([id])
GO
ALTER TABLE [dbo].[RolePermissions]  WITH CHECK ADD FOREIGN KEY([role_id])
REFERENCES [dbo].[Roles] ([id])
GO
ALTER TABLE [dbo].[Subcategories]  WITH CHECK ADD FOREIGN KEY([category_id])
REFERENCES [dbo].[Categories] ([id])
GO
ALTER TABLE [dbo].[UserRoles]  WITH CHECK ADD FOREIGN KEY([role_id])
REFERENCES [dbo].[Roles] ([id])
GO
ALTER TABLE [dbo].[UserRoles]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD  CONSTRAINT [FK_users_role] FOREIGN KEY([role_id])
REFERENCES [dbo].[Roles] ([id])
GO
ALTER TABLE [dbo].[Users] CHECK CONSTRAINT [FK_users_role]
GO
ALTER TABLE [dbo].[CashTransactions]  WITH CHECK ADD CHECK  (([type]='adjustment' OR [type]='withdrawal' OR [type]='deposit' OR [type]='expense' OR [type]='income'))
GO
ALTER TABLE [dbo].[Coupons]  WITH CHECK ADD CHECK  (([discount_type]='fixed_amount' OR [discount_type]='percentage'))
GO
ALTER TABLE [dbo].[InventoryMovements]  WITH CHECK ADD CHECK  (([movement_type]='stock_take' OR [movement_type]='return' OR [movement_type]='adjustment' OR [movement_type]='purchase' OR [movement_type]='sale'))
GO
ALTER TABLE [dbo].[Orders]  WITH CHECK ADD CHECK  (([type]='salon' OR [type]='delivery' OR [type]='pedido' OR [type]='orden'))
GO
/****** Object:  StoredProcedure [dbo].[SyncImageTables]    Script Date: 30/05/2025 0:08:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

          CREATE PROCEDURE [dbo].[SyncImageTables]
          AS
          BEGIN
            -- Ensure images table exists
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[images]') AND type IN (N'U'))
            BEGIN
              CREATE TABLE images (
                id INT PRIMARY KEY IDENTITY(1,1),
                image VARBINARY(MAX) NULL,
                path NVARCHAR(255) NULL,
                url NVARCHAR(500) NULL,
                mime_type NVARCHAR(100) NULL,
                storage_type VARCHAR(255) NULL,
                created_at DATETIME DEFAULT GETDATE(),
                updated_at DATETIME DEFAULT GETDATE()
              );
              
              ALTER TABLE images ADD CONSTRAINT CHK_images_storage_type 
              CHECK (storage_type IN ('database', 'disk', 'cloud'));
            END
            
            -- Ensure image_links table exists
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[image_links]') AND type IN (N'U'))
            BEGIN
              CREATE TABLE image_links (
                id INT PRIMARY KEY IDENTITY(1,1),
                image_id INT NOT NULL,
                owner_type NVARCHAR(50) NOT NULL,
                owner_id INT NOT NULL,
                tag NVARCHAR(50) NULL,
                created_at DATETIME DEFAULT GETDATE(),
                updated_at DATETIME DEFAULT GETDATE()
              );
            END
          END
GO
USE [master]
GO
ALTER DATABASE [gustados] SET  READ_WRITE 
GO
