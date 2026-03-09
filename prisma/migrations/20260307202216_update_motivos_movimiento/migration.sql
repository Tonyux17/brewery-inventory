/*
  Warnings:

  - The values [COMPRA,DEVOLUCION,MANUAL] on the enum `MotivoMovimiento` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MotivoMovimiento_new" AS ENUM ('PRODUCCION', 'VENTA', 'MERMA', 'AJUSTE_MANUAL');
ALTER TABLE "MovimientoInventario" ALTER COLUMN "motivo" TYPE "MotivoMovimiento_new" USING ("motivo"::text::"MotivoMovimiento_new");
ALTER TYPE "MotivoMovimiento" RENAME TO "MotivoMovimiento_old";
ALTER TYPE "MotivoMovimiento_new" RENAME TO "MotivoMovimiento";
DROP TYPE "public"."MotivoMovimiento_old";
COMMIT;
