-- CreateEnum
CREATE TYPE "OrderState" AS ENUM ('FREE', 'PAYING', 'PAYED');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "orderState" "OrderState" NOT NULL DEFAULT E'FREE',
ALTER COLUMN "travelerId" DROP NOT NULL;
