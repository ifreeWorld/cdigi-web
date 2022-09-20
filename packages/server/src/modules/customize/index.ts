// select * from tbl_sale;

// select DISTINCT(product_name) from tbl_sale;

// select week, SUM(quantity) from tbl_sale GROUP BY week order by week;

// (select s.week, s.customer_id, c.customer_name, s.quantity, c.country, c.region from tbl_sale s LEFT JOIN tbl_customer c on s.customer_id = c.id) ;

// 销售

// SELECT
// 	tmp.WEEK,
// 	IFNULL(SUM( CASE WHEN tmp.country = "china" THEN tmp.quantity END ),0) AS china,
// 	IFNULL(SUM( CASE WHEN tmp.country = "usa" THEN tmp.quantity END ),0) AS usa,
// 	SUM( tmp.quantity ) as total
// FROM
// 	(
// 	SELECT
// 		s.WEEK,
// 		s.customer_id,
// 		s.quantity,
// 		c.customer_name,
// 		c.country,
// 		c.region
// 	FROM
// 		tbl_sale s
// 		LEFT JOIN tbl_customer c ON s.customer_id = c.id
// 	) AS tmp
// GROUP BY
// 	tmp.WEEK;

// SELECT
// 	a.*,
// 	SUBSTRING_INDEX( a.WEEK, '-', 1 ) AS year,
// 	SUBSTRING_INDEX( a.WEEK, '-', - 1 ) AS weekstr,
// 	b.vendor_name AS vendorName,
// 	b.category_first_name AS categoryFirstName,
// 	b.category_second_name AS categorySecondName,
// 	b.category_third_name AS categoryThirdName
// FROM
// 	(
// 	SELECT
// 		s.*,
// 		c.customer_name AS customerName,
// 		c.email,
// 		c.country,
// 		c.region,
// 		c.customer_type AS customerType
// 	FROM
// 		(
// 		SELECT
// -- 			sale.*,
// 			sale.id,
// 			sale.creator_id AS creatorId,
// 			sale.create_time AS createTime,
// 			sale.update_time AS updateTime,
// 			sale.week_start_date AS weekStartDate,
// 			sale.week_end_date AS weekEndDate,
// 			sale.week,
// 			sale.customer_id as customerId,
// 			sale.product_id as productId,
// 			sale.product_name as productName,
// 			sale.quantity,
// 			sale.price,
// 			sale.total,
// 			sale.store_id as storeId,
// 			sale.store_name as storeName,
// 			sale.date,
// 			sale.buyer_id AS buyerId,
// 			sale.buyer_name AS buyerName,
// 			buy.customer_type AS buyerCustomerType
// 		FROM
// 			tbl_sale sale
// 			LEFT JOIN tbl_customer buy ON sale.customer_id = buy.id
// 		) s
// 		LEFT JOIN tbl_customer c ON s.customerId = c.id
// 	) a
// 	LEFT JOIN tbl_product b ON a.productId = b.id

// 库存

// SELECT
// 	a.*,
// 	SUBSTRING_INDEX( a.WEEK, '-', 1 ) AS year,
// 	SUBSTRING_INDEX( a.WEEK, '-', - 1 ) AS weekstr,
// 	b.vendor_name AS vendorName,
// 	b.category_first_name AS categoryFirstName,
// 	b.category_second_name AS categorySecondName,
// 	b.category_third_name AS categoryThirdName
// FROM
// 	(
// 	SELECT
// 		s.*,
// 		c.customer_name AS customerName,
// 		c.email,
// 		c.country,
// 		c.region,
// 		c.customer_type AS customerType
// 	FROM
// 		(
// 		SELECT
// 			stock.id,
// 			stock.creator_id AS creatorId,
// 			stock.create_time AS createTime,
// 			stock.update_time AS updateTime,
// 			stock.week_start_date AS weekStartDate,
// 			stock.week_end_date AS weekEndDate,
// 			stock.week,
// 			stock.customer_id as customerId,
// 			stock.product_id as productId,
// 			stock.product_name as productName,
// 			stock.quantity,
// 			stock.price,
// 			stock.total,
// 			stock.store_id as storeId,
// 			stock.store_name as storeName,
// 			stock.date
// 		FROM
// 			tbl_stock stock
// 		) s
// 		LEFT JOIN tbl_customer c ON s.customerId = c.id
// 	) a
// 	LEFT JOIN tbl_product b ON a.productId = b.id;
