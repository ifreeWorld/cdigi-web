const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class update1666772289518 {
    name = 'update1666772289518'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`tbl_report\` (\`id\` int NOT NULL AUTO_INCREMENT COMMENT '唯一 id', \`creator_id\` int NULL COMMENT '创建者 id', \`create_time\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`update_time\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`report_name\` varchar(255) NOT NULL COMMENT '报告名称', \`product_names\` text NOT NULL COMMENT '产品型号，1;2;3;4', \`report_type\` int NOT NULL COMMENT '报告类型，周报1 月报2', UNIQUE INDEX \`IDX_e0c7c7d504cd098e7baf29a44e\` (\`report_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`tbl_customer\` CHANGE \`customer_type\` \`customer_type\` enum ('1', '2', '3') NOT NULL COMMENT '渠道层级 1|品牌商 2|代理商 3|经销商'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`tbl_customer\` CHANGE \`customer_type\` \`customer_type\` enum ('1', '2', '3') NOT NULL COMMENT '客户类型 1|品牌商 2|代理商 3|经销商'`);
        await queryRunner.query(`DROP INDEX \`IDX_e0c7c7d504cd098e7baf29a44e\` ON \`tbl_report\``);
        await queryRunner.query(`DROP TABLE \`tbl_report\``);
    }
}
