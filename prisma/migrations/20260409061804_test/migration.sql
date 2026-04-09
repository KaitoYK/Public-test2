/*
  Warnings:

  - You are about to drop the `Categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Prompt_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Prompt_variables` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Prompt_versions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Prompts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Prompt_tags" DROP CONSTRAINT "Prompt_tags_prompt_id_fkey";

-- DropForeignKey
ALTER TABLE "Prompt_tags" DROP CONSTRAINT "Prompt_tags_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "Prompt_variables" DROP CONSTRAINT "Prompt_variables_prompt_id_fkey";

-- DropForeignKey
ALTER TABLE "Prompt_versions" DROP CONSTRAINT "Prompt_versions_created_by_fkey";

-- DropForeignKey
ALTER TABLE "Prompt_versions" DROP CONSTRAINT "Prompt_versions_prompt_id_fkey";

-- DropForeignKey
ALTER TABLE "Prompts" DROP CONSTRAINT "Prompts_category_id_fkey";

-- DropForeignKey
ALTER TABLE "Prompts" DROP CONSTRAINT "Prompts_owner_id_fkey";

-- DropTable
DROP TABLE "Categories";

-- DropTable
DROP TABLE "Prompt_tags";

-- DropTable
DROP TABLE "Prompt_variables";

-- DropTable
DROP TABLE "Prompt_versions";

-- DropTable
DROP TABLE "Prompts";

-- DropTable
DROP TABLE "Tags";
