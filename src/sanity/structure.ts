import type { StructureResolver } from "sanity/structure";

/**
 * Custom Studio structure — groups documents into intuitive editor sections
 * that match the OWL admin mental model (matches surfaces in
 * ../../OWL-Obsidian-Brain/04_CRM_Admin/ADMIN_CRM_REQUIREMENTS.md).
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("OWL Content")
    .items([
      S.listItem()
        .title("📝 Blog")
        .child(
          S.list()
            .title("Blog")
            .items([
              S.documentTypeListItem("blogArticle").title("Articles"),
              S.documentTypeListItem("blogCategory").title("Categories (6 hubs)"),
            ])
        ),
      S.divider(),
      S.listItem()
        .title("🎬 Videos & Music")
        .child(
          S.list()
            .title("Videos & Music")
            .items([
              S.documentTypeListItem("video").title("Videos"),
              S.documentTypeListItem("song").title("Songs"),
              S.documentTypeListItem("playlist").title("Playlists"),
            ])
        ),
      S.divider(),
      S.listItem()
        .title("🛒 Shop")
        .child(
          S.list()
            .title("Shop")
            .items([S.documentTypeListItem("product").title("Products")])
        ),
      S.listItem()
        .title("📄 Printables")
        .child(
          S.list()
            .title("Printables")
            .items([S.documentTypeListItem("printable").title("Printables")])
        ),
      S.divider(),
      S.listItem()
        .title("🎉 Holidays")
        .child(
          S.list()
            .title("Holidays")
            .items([S.documentTypeListItem("holidayHub").title("Holiday Hubs")])
        ),
      S.divider(),
      S.listItem()
        .title("👩‍🏫 Educator Resources")
        .child(
          S.list()
            .title("Educator Resources")
            .items([
              S.documentTypeListItem("educatorResource").title("Resources"),
            ])
        ),
      S.divider(),
      S.listItem()
        .title("📧 Newsletter Blocks")
        .child(
          S.list()
            .title("Newsletter Blocks")
            .items([S.documentTypeListItem("newsletterBlock").title("Reusable Blocks")])
        ),
      S.divider(),
      S.listItem()
        .title("🖼️ Gallery")
        .child(
          S.list()
            .title("Gallery")
            .items([S.documentTypeListItem("galleryItem").title("Gallery Items")])
        ),
    ]);
