const { MigrationInterface, QueryRunner } = require('typeorm');

module.exports = class update1665034596707 {
  name = 'update1665034596707';

  async up(queryRunner) {
    await queryRunner.query(
      `CREATE TABLE \`tbl_customize\` (\`id\` int NOT NULL AUTO_INCREMENT COMMENT '唯一 id', \`creator_id\` int NULL COMMENT '创建者 id', \`create_time\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`update_time\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`customize_name\` varchar(255) NOT NULL COMMENT '自定义分析名称', \`desc\` varchar(255) NULL COMMENT '自定义分析描述说明', \`pivot\` json NOT NULL COMMENT '数据透视表配置', UNIQUE INDEX \`IDX_31aae669a08349d42e1a2d3061\` (\`customize_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` ADD \`year\` int NOT NULL COMMENT '年。格式：2022'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` ADD \`weekalone\` int NOT NULL COMMENT '周。格式：1、2、3、4'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` ADD \`quarter\` int NOT NULL COMMENT '季度。格式：1、2、3、4'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` ADD \`month\` int NOT NULL COMMENT '月。格式：1'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` ADD \`month_week\` int NOT NULL COMMENT '月-周，与month一起配合使用形成月-周。格式：1、2、3、4、5'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` ADD \`year\` int NOT NULL COMMENT '年。格式：2022'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` ADD \`weekalone\` int NOT NULL COMMENT '周。格式：1、2、3、4'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` ADD \`quarter\` int NOT NULL COMMENT '季度。格式：1、2、3、4'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` ADD \`month\` int NOT NULL COMMENT '月。格式：1'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` ADD \`month_week\` int NOT NULL COMMENT '月-周，与month一起配合使用形成月-周。格式：1、2、3、4、5'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_product\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_product\` CHANGE \`category_first_name\` \`category_first_name\` varchar(255) NULL COMMENT '一级分类'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_product\` CHANGE \`category_second_name\` \`category_second_name\` varchar(255) NULL COMMENT '二级分类'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_product\` CHANGE \`category_third_name\` \`category_third_name\` varchar(255) NULL COMMENT '三级分类'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_tag\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_store\` DROP FOREIGN KEY \`FK_86b44e9550889698ab8baa5d23a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_store\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_store\` CHANGE \`region\` \`region\` varchar(255) NULL COMMENT '门店区域'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_store\` CHANGE \`store_address\` \`store_address\` varchar(255) NULL COMMENT '门店地址'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_store\` CHANGE \`customer_id\` \`customer_id\` int NULL COMMENT '唯一 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_customer\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` DROP FOREIGN KEY \`FK_f4cf198389259b2a11b88b78611\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` DROP FOREIGN KEY \`FK_45439488f9077086ad54508f31b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` DROP FOREIGN KEY \`FK_16dc5967d53d4f8cc68980e3ce9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` CHANGE \`price\` \`price\` int NULL COMMENT '价格'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` CHANGE \`total\` \`total\` int NULL COMMENT '总价'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` CHANGE \`store_name\` \`store_name\` varchar(255) NULL COMMENT '门店名称'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` CHANGE \`date\` \`date\` date NULL COMMENT '日。格式：2022-12-01，客户上传数据中带时间才会有'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` CHANGE \`customer_id\` \`customer_id\` int NULL COMMENT '唯一 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` CHANGE \`product_id\` \`product_id\` int NULL COMMENT '唯一 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` CHANGE \`store_id\` \`store_id\` int NULL COMMENT '唯一 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_transit\` DROP FOREIGN KEY \`FK_ac6e50a022df3d0898f0aed1415\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_transit\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_transit\` CHANGE \`price\` \`price\` int NULL COMMENT '价格'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_transit\` CHANGE \`total\` \`total\` int NULL COMMENT '总价'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_transit\` CHANGE \`eta\` \`eta\` date NULL COMMENT '预计到达时间'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_transit\` CHANGE \`shipping_date\` \`shipping_date\` date NULL COMMENT '在途库存 - 运输时间'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_transit\` CHANGE \`warehousing_date\` \`warehousing_date\` date NULL COMMENT '入库时间'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_transit\` CHANGE \`customer_id\` \`customer_id\` int NULL COMMENT '唯一 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_user\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` DROP FOREIGN KEY \`FK_3074a805d7c3d7062783cccbb31\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` DROP FOREIGN KEY \`FK_83fd3cc017ad33c7ab16251087d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` DROP FOREIGN KEY \`FK_99fdad62b05c3286d145926204f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` DROP FOREIGN KEY \`FK_c93e62b4fd459ad100a7974d4b3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`price\` \`price\` int NULL COMMENT '价格'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`total\` \`total\` int NULL COMMENT '总价'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`store_name\` \`store_name\` varchar(255) NULL COMMENT '门店名称'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`date\` \`date\` date NULL COMMENT '日。格式：2022-12-01，客户上传数据中带时间才会有'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`buyer_name\` \`buyer_name\` varchar(255) NULL COMMENT '下级客户名称'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`customer_id\` \`customer_id\` int NULL COMMENT '唯一 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`product_id\` \`product_id\` int NULL COMMENT '唯一 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`store_id\` \`store_id\` int NULL COMMENT '唯一 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`buyer_id\` \`buyer_id\` int NULL COMMENT '唯一 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_store\` ADD CONSTRAINT \`FK_86b44e9550889698ab8baa5d23a\` FOREIGN KEY (\`customer_id\`) REFERENCES \`tbl_customer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` ADD CONSTRAINT \`FK_f4cf198389259b2a11b88b78611\` FOREIGN KEY (\`customer_id\`) REFERENCES \`tbl_customer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` ADD CONSTRAINT \`FK_45439488f9077086ad54508f31b\` FOREIGN KEY (\`product_id\`) REFERENCES \`tbl_product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` ADD CONSTRAINT \`FK_16dc5967d53d4f8cc68980e3ce9\` FOREIGN KEY (\`store_id\`) REFERENCES \`tbl_store\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_transit\` ADD CONSTRAINT \`FK_ac6e50a022df3d0898f0aed1415\` FOREIGN KEY (\`customer_id\`) REFERENCES \`tbl_customer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` ADD CONSTRAINT \`FK_3074a805d7c3d7062783cccbb31\` FOREIGN KEY (\`customer_id\`) REFERENCES \`tbl_customer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` ADD CONSTRAINT \`FK_83fd3cc017ad33c7ab16251087d\` FOREIGN KEY (\`product_id\`) REFERENCES \`tbl_product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` ADD CONSTRAINT \`FK_99fdad62b05c3286d145926204f\` FOREIGN KEY (\`store_id\`) REFERENCES \`tbl_store\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` ADD CONSTRAINT \`FK_c93e62b4fd459ad100a7974d4b3\` FOREIGN KEY (\`buyer_id\`) REFERENCES \`tbl_customer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` DROP FOREIGN KEY \`FK_c93e62b4fd459ad100a7974d4b3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` DROP FOREIGN KEY \`FK_99fdad62b05c3286d145926204f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` DROP FOREIGN KEY \`FK_83fd3cc017ad33c7ab16251087d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` DROP FOREIGN KEY \`FK_3074a805d7c3d7062783cccbb31\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_transit\` DROP FOREIGN KEY \`FK_ac6e50a022df3d0898f0aed1415\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` DROP FOREIGN KEY \`FK_16dc5967d53d4f8cc68980e3ce9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` DROP FOREIGN KEY \`FK_45439488f9077086ad54508f31b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` DROP FOREIGN KEY \`FK_f4cf198389259b2a11b88b78611\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_store\` DROP FOREIGN KEY \`FK_86b44e9550889698ab8baa5d23a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`buyer_id\` \`buyer_id\` int NULL COMMENT '唯一 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`store_id\` \`store_id\` int NULL COMMENT '唯一 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`product_id\` \`product_id\` int NULL COMMENT '唯一 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`customer_id\` \`customer_id\` int NULL COMMENT '唯一 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`buyer_name\` \`buyer_name\` varchar(255) NULL COMMENT '下级客户名称' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`date\` \`date\` date NULL COMMENT '日。格式：2022-12-01，客户上传数据中带时间才会有' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`store_name\` \`store_name\` varchar(255) NULL COMMENT '门店名称' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`total\` \`total\` int NULL COMMENT '总价' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`price\` \`price\` int NULL COMMENT '价格' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` ADD CONSTRAINT \`FK_c93e62b4fd459ad100a7974d4b3\` FOREIGN KEY (\`buyer_id\`) REFERENCES \`tbl_customer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` ADD CONSTRAINT \`FK_99fdad62b05c3286d145926204f\` FOREIGN KEY (\`store_id\`) REFERENCES \`tbl_store\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` ADD CONSTRAINT \`FK_83fd3cc017ad33c7ab16251087d\` FOREIGN KEY (\`product_id\`) REFERENCES \`tbl_product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` ADD CONSTRAINT \`FK_3074a805d7c3d7062783cccbb31\` FOREIGN KEY (\`customer_id\`) REFERENCES \`tbl_customer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_user\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_transit\` CHANGE \`customer_id\` \`customer_id\` int NULL COMMENT '唯一 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_transit\` CHANGE \`warehousing_date\` \`warehousing_date\` date NULL COMMENT '入库时间' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_transit\` CHANGE \`shipping_date\` \`shipping_date\` date NULL COMMENT '在途库存 - 运输时间' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_transit\` CHANGE \`eta\` \`eta\` date NULL COMMENT '预计到达时间' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_transit\` CHANGE \`total\` \`total\` int NULL COMMENT '总价' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_transit\` CHANGE \`price\` \`price\` int NULL COMMENT '价格' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_transit\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_transit\` ADD CONSTRAINT \`FK_ac6e50a022df3d0898f0aed1415\` FOREIGN KEY (\`customer_id\`) REFERENCES \`tbl_customer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` CHANGE \`store_id\` \`store_id\` int NULL COMMENT '唯一 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` CHANGE \`product_id\` \`product_id\` int NULL COMMENT '唯一 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` CHANGE \`customer_id\` \`customer_id\` int NULL COMMENT '唯一 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` CHANGE \`date\` \`date\` date NULL COMMENT '日。格式：2022-12-01，客户上传数据中带时间才会有' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` CHANGE \`store_name\` \`store_name\` varchar(255) NULL COMMENT '门店名称' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` CHANGE \`total\` \`total\` int NULL COMMENT '总价' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` CHANGE \`price\` \`price\` int NULL COMMENT '价格' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` ADD CONSTRAINT \`FK_16dc5967d53d4f8cc68980e3ce9\` FOREIGN KEY (\`store_id\`) REFERENCES \`tbl_store\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` ADD CONSTRAINT \`FK_45439488f9077086ad54508f31b\` FOREIGN KEY (\`product_id\`) REFERENCES \`tbl_product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` ADD CONSTRAINT \`FK_f4cf198389259b2a11b88b78611\` FOREIGN KEY (\`customer_id\`) REFERENCES \`tbl_customer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_customer\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_store\` CHANGE \`customer_id\` \`customer_id\` int NULL COMMENT '唯一 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_store\` CHANGE \`store_address\` \`store_address\` varchar(255) NULL COMMENT '门店地址' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_store\` CHANGE \`region\` \`region\` varchar(255) NULL COMMENT '门店区域' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_store\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_store\` ADD CONSTRAINT \`FK_86b44e9550889698ab8baa5d23a\` FOREIGN KEY (\`customer_id\`) REFERENCES \`tbl_customer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_tag\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_product\` CHANGE \`category_third_name\` \`category_third_name\` varchar(255) NULL COMMENT '三级分类' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_product\` CHANGE \`category_second_name\` \`category_second_name\` varchar(255) NULL COMMENT '二级分类' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_product\` CHANGE \`category_first_name\` \`category_first_name\` varchar(255) NULL COMMENT '一级分类' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_product\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` DROP COLUMN \`month_week\``,
    );
    await queryRunner.query(`ALTER TABLE \`tbl_sale\` DROP COLUMN \`month\``);
    await queryRunner.query(`ALTER TABLE \`tbl_sale\` DROP COLUMN \`quarter\``);
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` DROP COLUMN \`weekalone\``,
    );
    await queryRunner.query(`ALTER TABLE \`tbl_sale\` DROP COLUMN \`year\``);
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` DROP COLUMN \`month_week\``,
    );
    await queryRunner.query(`ALTER TABLE \`tbl_stock\` DROP COLUMN \`month\``);
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` DROP COLUMN \`quarter\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` DROP COLUMN \`weekalone\``,
    );
    await queryRunner.query(`ALTER TABLE \`tbl_stock\` DROP COLUMN \`year\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_31aae669a08349d42e1a2d3061\` ON \`tbl_customize\``,
    );
    await queryRunner.query(`DROP TABLE \`tbl_customize\``);
  }
};
