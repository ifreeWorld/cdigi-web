const { MigrationInterface, QueryRunner } = require('typeorm');

module.exports = class update1662910925720 {
  name = 'update1662910925720';

  async up(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE \`tbl_store\` ADD \`region\` varchar(255) NULL COMMENT '门店区域'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` ADD \`date\` date NULL COMMENT '日。格式：2022-12-01，客户上传数据中带时间才会有'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` ADD \`product_id\` int NULL COMMENT '唯一 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` ADD \`store_id\` int NULL COMMENT '唯一 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` ADD \`buyer_name\` varchar(255) NULL COMMENT '下级客户名称'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` ADD \`product_id\` int NULL COMMENT '唯一 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` ADD \`store_id\` int NULL COMMENT '唯一 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` ADD \`buyer_id\` int NULL COMMENT '唯一 id'`,
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
      `ALTER TABLE \`tbl_store\` CHANGE \`store_address\` \`store_address\` varchar(255) NULL COMMENT '门店地址'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_store\` CHANGE \`customer_id\` \`customer_id\` int NULL COMMENT '唯一 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_customer\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_customer\` CHANGE \`customer_name\` \`customer_name\` varchar(255) NOT NULL COMMENT '客户名称'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_customer\` CHANGE \`customer_type\` \`customer_type\` enum ('1', '2', '3') NOT NULL COMMENT '客户类型 1|品牌商 2|代理商 3|经销商'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_customer\` CHANGE \`email\` \`email\` varchar(255) NOT NULL COMMENT '客户邮箱'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_user\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_user\` CHANGE \`username\` \`username\` varchar(255) NOT NULL COMMENT '客户名'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` DROP FOREIGN KEY \`FK_f4cf198389259b2a11b88b78611\``,
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
      `ALTER TABLE \`tbl_stock\` CHANGE \`customer_id\` \`customer_id\` int NULL COMMENT '唯一 id'`,
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
      `ALTER TABLE \`tbl_sale\` DROP FOREIGN KEY \`FK_3074a805d7c3d7062783cccbb31\``,
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
      `ALTER TABLE \`tbl_sale\` CHANGE \`customer_id\` \`customer_id\` int NULL COMMENT '唯一 id'`,
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
      `ALTER TABLE \`tbl_sale\` CHANGE \`customer_id\` \`customer_id\` int NULL COMMENT '唯一 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` CHANGE \`date\` \`date\` date NULL COMMENT '日。格式：2022-12-01，用户上传数据中带时间才会有' DEFAULT NULL`,
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
      `ALTER TABLE \`tbl_sale\` ADD CONSTRAINT \`FK_3074a805d7c3d7062783cccbb31\` FOREIGN KEY (\`customer_id\`) REFERENCES \`tbl_customer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE \`tbl_stock\` CHANGE \`customer_id\` \`customer_id\` int NULL COMMENT '唯一 id' DEFAULT NULL`,
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
      `ALTER TABLE \`tbl_stock\` ADD CONSTRAINT \`FK_f4cf198389259b2a11b88b78611\` FOREIGN KEY (\`customer_id\`) REFERENCES \`tbl_customer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_user\` CHANGE \`username\` \`username\` varchar(255) NOT NULL COMMENT '用户名'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_user\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_customer\` CHANGE \`email\` \`email\` varchar(255) NOT NULL COMMENT '用户邮箱'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_customer\` CHANGE \`customer_type\` \`customer_type\` enum ('1', '2', '3') NOT NULL COMMENT '用户类型 1|品牌商 2|代理商 3|经销商'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_customer\` CHANGE \`customer_name\` \`customer_name\` varchar(255) NOT NULL COMMENT '用户名称'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_customer\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_store\` CHANGE \`customer_id\` \`customer_id\` int NULL COMMENT '唯一 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_store\` CHANGE \`store_address\` \`store_address\` varchar(255) NOT NULL COMMENT '门店地址'`,
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
      `ALTER TABLE \`tbl_product\` CHANGE \`category_third_name\` \`category_third_name\` varchar(255) NOT NULL COMMENT '三级分类'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_product\` CHANGE \`category_second_name\` \`category_second_name\` varchar(255) NOT NULL COMMENT '二级分类'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_product\` CHANGE \`category_first_name\` \`category_first_name\` varchar(255) NOT NULL COMMENT '一级分类'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_product\` CHANGE \`creator_id\` \`creator_id\` int NULL COMMENT '创建者 id' DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` DROP COLUMN \`buyer_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` DROP COLUMN \`store_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` DROP COLUMN \`product_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_sale\` DROP COLUMN \`buyer_name\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` DROP COLUMN \`store_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tbl_stock\` DROP COLUMN \`product_id\``,
    );
    await queryRunner.query(`ALTER TABLE \`tbl_stock\` DROP COLUMN \`date\``);
    await queryRunner.query(`ALTER TABLE \`tbl_store\` DROP COLUMN \`region\``);
  }
};
