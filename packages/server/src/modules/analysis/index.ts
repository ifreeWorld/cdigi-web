// select * from tbl_sale;

// select DISTINCT(product_name) from tbl_sale;

// select week, SUM(quantity) from tbl_sale GROUP BY week order by week;

// (select s.week, s.customer_id, c.customer_name, s.quantity, c.country, c.region from tbl_sale s LEFT JOIN tbl_customer c on s.customer_id = c.id) ;

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