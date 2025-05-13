-- Create driver_orders table if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'driver_orders')
BEGIN
    CREATE TABLE [dbo].[driver_orders](
        [order_id] [varchar](255) NOT NULL,
        	[driver_id] [varchar](255) NULL,
        	[user_id] [varchar](255) NULL,
        	[user_name] [varchar](255) NULL,
        	[restaurant_id] [varchar](255) NULL,
        	[delivery_address] [varchar](500) NULL,
        	[order_items] [nvarchar](max) NULL,
        	[price] [decimal](10, 2) NULL,
        	[order_date] [varchar](50) NULL,
        	[order_time] [varchar](50) NULL,
        	[is_order_complete] [bit] NULL,
        	[remarks] [varchar](1000) NULL,
        CONSTRAINT PK_driver_orders PRIMARY KEY CLUSTERED ([order_id] ASC)
    );
END;

-- Create location table if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'location')
BEGIN
    CREATE TABLE [dbo].[location](
       [id] [bigint] IDENTITY(1,1) NOT NULL,
      	[latitude] [float] NOT NULL,
      	[longitude] [float] NOT NULL,
      	[user_id] [varchar](255) NOT NULL,
      	[timestamp] [datetime] NULL,
      	[order_id] [varchar](50) NULL,
        CONSTRAINT PK_location PRIMARY KEY CLUSTERED ([id] ASC)
    );

    ALTER TABLE [dbo].[location] ADD DEFAULT (getdate()) FOR [timestamp];
END;
