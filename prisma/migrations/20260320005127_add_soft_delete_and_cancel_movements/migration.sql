-- CreateEnum
CREATE TYPE "EstadoMovimiento" AS ENUM ('ACTIVO', 'ANULADO');

-- AlterTable
ALTER TABLE "MovimientoInventario" ADD COLUMN     "anuladoEn" TIMESTAMP(3),
ADD COLUMN     "estado" "EstadoMovimiento" NOT NULL DEFAULT 'ACTIVO',
ADD COLUMN     "motivoAnulacion" TEXT;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;
