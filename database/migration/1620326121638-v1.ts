import {MigrationInterface, QueryRunner} from "typeorm";

export class v11620326121638 implements MigrationInterface {
    name = 'v11620326121638'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `payment` (`id` int NOT NULL AUTO_INCREMENT, `order_id` int NOT NULL, `user_id` int NOT NULL, `payment_type` tinyint NOT NULL, `status` tinyint NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `payment`");
    }

}
