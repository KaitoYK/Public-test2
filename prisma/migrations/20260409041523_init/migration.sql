-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" VARCHAR(30) NOT NULL DEFAULT 'VIEWER',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "color" VARCHAR(30),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prompts" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    "visibility" VARCHAR(30) NOT NULL DEFAULT 'PRIVATE',
    "latest_version_no" INTEGER NOT NULL DEFAULT 1,
    "recommended_model" VARCHAR(100),
    "is_template_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,
    "category_id" INTEGER,
    "owner_id" INTEGER NOT NULL,

    CONSTRAINT "Prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tags" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prompt_versions" (
    "id" SERIAL NOT NULL,
    "version_no" INTEGER NOT NULL,
    "template_content" TEXT NOT NULL,
    "system_prompt" TEXT,
    "output_format" TEXT,
    "changelog" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prompt_id" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL,

    CONSTRAINT "Prompt_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prompt_variables" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "label" VARCHAR(150) NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "default_value" TEXT,
    "placeholder" TEXT,
    "description" TEXT,
    "options_json" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prompt_id" INTEGER NOT NULL,

    CONSTRAINT "Prompt_variables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prompt_tags" (
    "prompt_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "Prompt_tags_pkey" PRIMARY KEY ("prompt_id","tag_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Categories_name_key" ON "Categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Prompts_slug_key" ON "Prompts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tags_name_key" ON "Tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Prompt_versions_prompt_id_version_no_key" ON "Prompt_versions"("prompt_id", "version_no");

-- CreateIndex
CREATE UNIQUE INDEX "Prompt_variables_prompt_id_name_key" ON "Prompt_variables"("prompt_id", "name");

-- AddForeignKey
ALTER TABLE "Prompts" ADD CONSTRAINT "Prompts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompts" ADD CONSTRAINT "Prompts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt_versions" ADD CONSTRAINT "Prompt_versions_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "Prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt_versions" ADD CONSTRAINT "Prompt_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt_variables" ADD CONSTRAINT "Prompt_variables_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "Prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt_tags" ADD CONSTRAINT "Prompt_tags_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "Prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt_tags" ADD CONSTRAINT "Prompt_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
