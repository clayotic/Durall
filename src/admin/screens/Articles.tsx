import { useEffect, useId, useMemo, useState, type ComponentType } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  ChartBar,
  CheckCheck,
  Clapperboard,
  Columns2,
  ExternalLink,
  Flag,
  Heading2,
  ImageIcon,
  Images,
  LayoutGrid,
  LetterText,
  List,
  ListChecks,
  Megaphone,
  Milestone,
  Pilcrow,
  Pin,
  Plus,
  Quote,
  Route,
  Search,
  TextQuote,
  Trash2,
  Workflow,
  type LucideProps,
} from "lucide-react";
import { blankArticle, placeholderPhoto, slugify } from "@/content/defaults";
import { imageOf } from "@/content/render";
import { formatDate, readingTimeOf } from "@/content/select";
import type { ArticleBlock, ArticleDoc, ArticleSeries } from "@/content/types";
import { embedOf } from "@/content/video";
import { deleteArticle, saveArticle } from "@/admin/api/content";
import { useAdmin } from "@/admin/context";
import { FieldControl, FieldGrid, PhotoField } from "@/admin/form/fields";
import type { FieldSpec } from "@/admin/form/spec";
import { area, list, number, photo, strings, text } from "@/admin/specs/build";
import { SaveBar, useEditor } from "@/admin/lib/editor";
import {
  Badge,
  Button,
  ButtonLink,
  buttonClass,
  Card,
  EmptyState,
  Field,
  IconButton,
  PageHeader,
  Select,
  TextArea,
  TextInput,
  Toggle,
} from "@/admin/ui/controls";
import { errorMessage, useConfirm, useToast } from "@/admin/ui/overlay";
import { cn } from "@/lib/utils";

/* ── List ────────────────────────────────────────────────────────────────── */

export function ArticlesList({ articles }: { articles: ArticleDoc[] }) {
  const { editable } = useAdmin();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const sorted = useMemo(
    () =>
      [...articles].sort(
        (a, b) => Number(b.pinned) - Number(a.pinned) || b.publishedAt.localeCompare(a.publishedAt),
      ),
    [articles],
  );
  const needle = query.trim().toLowerCase();
  const shown = sorted.filter(
    (a) =>
      (status === "all" || a.status === status) &&
      (!needle || `${a.title} ${a.category} ${a.excerpt}`.toLowerCase().includes(needle)),
  );

  return (
    <>
      <PageHeader
        title="Insights"
        description="The articles on the Insights page. The newest published one leads the list, unless one is pinned."
        actions={
          editable ? (
            <ButtonLink to="/admin/insights/$id" params={{ id: "new" }} variant="primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Article
            </ButtonLink>
          ) : null
        }
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Show" className="inline-flex rounded-full bg-navy/6 p-1">
          {(["all", "published", "draft"] as const).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={status === key}
              onClick={() => setStatus(key)}
              className={cn(
                "admin-focus min-h-8 rounded-full px-3.5 text-xs font-medium capitalize transition-colors duration-150",
                status === key ? "bg-white text-navy shadow-sm" : "text-slate hover:text-navy",
              )}
            >
              {key === "all" ? "All" : key === "published" ? "Published" : "Drafts"}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate"
          />
          <TextInput
            type="search"
            aria-label="Search articles"
            placeholder="Search articles…"
            value={query}
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      {shown.length === 0 ? (
        <EmptyState
          title={articles.length ? "No articles match" : "No articles yet"}
          body={
            articles.length
              ? "Try another search or filter."
              : "Write the first one: it can stay a draft until it is ready."
          }
        />
      ) : (
        <ul className="grid gap-2">
          {shown.map((article) => {
            const cover = imageOf(article.cover.image);
            return (
              <li key={article.id}>
                <Link
                  to="/admin/insights/$id"
                  params={{ id: article.id }}
                  className="admin-focus flex items-center gap-4 rounded-2xl border border-navy/10 bg-white p-2.5 pr-4 transition-[border-color] duration-150 hover:border-navy/25"
                >
                  <img
                    src={cover.srcSet?.split(",")[0]?.trim().split(" ")[0] ?? cover.src}
                    alt=""
                    width={cover.width}
                    height={cover.height}
                    loading="lazy"
                    className="h-14 w-20 shrink-0 rounded-lg bg-glass object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium text-navy">
                        {article.title || "Untitled article"}
                      </span>
                      {article.format === "video" ? (
                        <Badge tone="neutral">
                          <Clapperboard className="h-3 w-3" aria-hidden="true" /> Film
                        </Badge>
                      ) : null}
                      {article.pinned ? (
                        <Badge tone="info">
                          <Pin className="h-3 w-3" aria-hidden="true" /> Pinned
                        </Badge>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate">
                      {[article.category, formatDate(article.publishedAt), article.readingTime]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <Badge tone={article.status === "published" ? "success" : "neutral"}>
                    {article.status === "published" ? "Published" : "Draft"}
                  </Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/* ── Editor ──────────────────────────────────────────────────────────────── */

export function ArticleEditor({
  article,
  categories,
  isNew,
}: {
  article: ArticleDoc;
  categories: string[];
  isNew: boolean;
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [autoTime, setAutoTime] = useState(isNew || article.readingTime === readingTimeOf(article));
  const editor = useEditor(
    article,
    async (doc) => (await saveArticle({ data: { doc, autoReadingTime: autoTime } })).doc,
  );
  const doc = editor.draft;
  const set = (patch: Partial<ArticleDoc>) => editor.setDraft({ ...doc, ...patch });
  const savedOnce = Boolean(editor.saved.id);
  const categoryList = useId();

  useEffect(() => {
    if (!isNew || !savedOnce) return;
    void navigate({
      to: "/admin/insights/$id",
      params: { id: editor.saved.id },
      replace: true,
      ignoreBlocker: true,
    });
  }, [editor.saved.id, isNew, navigate, savedOnce]);

  const remove = async () => {
    const ok = await confirm({
      title: `Delete “${doc.title || "this article"}”?`,
      body: "It disappears from the site straight away and cannot be brought back.",
      confirmLabel: "Delete Article",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteArticle({ data: { id: doc.id } });
      toast({ tone: "success", title: "Article deleted" });
      await navigate({ to: "/admin/insights", ignoreBlocker: true });
    } catch (error) {
      toast({ tone: "error", title: "Not deleted", body: errorMessage(error) });
    }
  };

  return (
    <>
      <SaveBar
        title={doc.title || "New article"}
        dirty={editor.dirty}
        saving={editor.saving}
        editable={editor.editable}
        onSave={() => void editor.submit()}
        onDiscard={() => void editor.discard()}
        extra={
          editor.saved.status === "published" && editor.saved.slug ? (
            <a
              href={`/insights/${editor.saved.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("ghost", "sm")}
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              View on Site
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : null
        }
      />
      <PageHeader
        title={doc.title || "New Article"}
        back={{ to: "/admin/insights", label: "All articles" }}
        actions={
          editor.editable && savedOnce ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void remove()}
              className="text-[#b42318] hover:bg-[#b42318]/8 hover:text-[#b42318]"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </Button>
          ) : null
        }
      />
      <fieldset
        disabled={!editor.editable}
        className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <div className="grid min-w-0 gap-5">
          <Card title="Article">
            <div className="grid gap-5">
              <Field label="Title">
                {({ id, describedBy }) => (
                  <TextInput
                    id={id}
                    aria-describedby={describedBy}
                    value={doc.title}
                    autoComplete="off"
                    placeholder="Understanding Premium Glazing…"
                    onChange={(event) =>
                      set({
                        title: event.target.value,
                        ...(slugTouched ? {} : { slug: slugify(event.target.value) }),
                      })
                    }
                  />
                )}
              </Field>
              <Field
                label="Standfirst"
                hint="The line under the title, and the summary in lists and search results."
              >
                {({ id, describedBy }) => (
                  <TextArea
                    id={id}
                    aria-describedby={describedBy}
                    rows={3}
                    value={doc.excerpt}
                    onChange={(event) => set({ excerpt: event.target.value })}
                  />
                )}
              </Field>
              {doc.format === "video" ? (
                <>
                  <Field
                    label="Film link"
                    hint="The film's YouTube or Vimeo address, as copied from the browser."
                    error={videoError(doc.video.url)}
                  >
                    {({ id, describedBy }) => (
                      <TextInput
                        id={id}
                        aria-describedby={describedBy}
                        type="url"
                        inputMode="url"
                        spellCheck={false}
                        autoComplete="off"
                        placeholder="https://www.youtube.com/watch?v=…"
                        value={doc.video.url}
                        onChange={(event) =>
                          set({ video: { ...doc.video, url: event.target.value.trim() } })
                        }
                      />
                    )}
                  </Field>
                  <Field label="Length" hint="Shown beside the film, for example: 6 min.">
                    {({ id, describedBy }) => (
                      <TextInput
                        id={id}
                        aria-describedby={describedBy}
                        autoComplete="off"
                        placeholder="6 min…"
                        value={doc.video.duration}
                        onChange={(event) =>
                          set({ video: { ...doc.video, duration: event.target.value } })
                        }
                      />
                    )}
                  </Field>
                </>
              ) : null}
              <PhotoField
                label={doc.format === "video" ? "Poster photograph" : "Cover photograph"}
                value={doc.cover}
                onChange={(cover) => set({ cover })}
              />
            </div>
          </Card>
          <Card
            title="Body"
            description={
              doc.series
                ? "Headings start new sections. Paragraphs, lists and quotes take **bold**, *italic* and [links](https://…). The laid-out pieces are the ones designed for the series."
                : "Headings start new sections. Paragraphs, lists and quotes take **bold**, *italic* and [links](https://…)."
            }
          >
            <BlockEditor
              blocks={doc.body}
              laidOut={Boolean(doc.series)}
              onChange={(body) => set({ body })}
            />
          </Card>
          <Card
            title="Premium Glazing Series"
            description="A part of the series has the series’ own page: its number, its place on the project line, and an opening picture. It is also listed at the top of the Insights page, in order."
          >
            <FieldControl
              spec={SERIES_FIELD}
              value={doc.series ?? null}
              onChange={(next) => {
                // Not in the series means the field is absent, not empty.
                const { series: _was, ...rest } = doc;
                editor.setDraft(next ? { ...rest, series: next as ArticleSeries } : rest);
              }}
            />
          </Card>
        </div>
        <div className="grid gap-5 xl:sticky xl:top-20">
          <Card title="Publishing">
            <div className="grid gap-5">
              <Field
                label="Format"
                hint="A film plays on the Insights page and leads its own page with the player."
              >
                {({ id, describedBy }) => (
                  <Select
                    id={id}
                    aria-describedby={describedBy}
                    value={doc.format}
                    onChange={(event) =>
                      set({ format: event.target.value as ArticleDoc["format"] })
                    }
                  >
                    <option value="article">Article</option>
                    <option value="video">Film</option>
                  </Select>
                )}
              </Field>
              <Field label="Status" hint="Drafts are saved but not shown on the site.">
                {({ id, describedBy }) => (
                  <Select
                    id={id}
                    aria-describedby={describedBy}
                    value={doc.status}
                    onChange={(event) =>
                      set({ status: event.target.value as ArticleDoc["status"] })
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </Select>
                )}
              </Field>
              <Field label="Date">
                {({ id, describedBy }) => (
                  <TextInput
                    id={id}
                    aria-describedby={describedBy}
                    type="date"
                    value={doc.publishedAt}
                    onChange={(event) => set({ publishedAt: event.target.value })}
                  />
                )}
              </Field>
              <Field label="Category" hint="For example: Engineering, Fabrication, Materials.">
                {({ id, describedBy }) => (
                  <>
                    <TextInput
                      id={id}
                      aria-describedby={describedBy}
                      list={categoryList}
                      value={doc.category}
                      autoComplete="off"
                      onChange={(event) => set({ category: event.target.value })}
                    />
                    <datalist id={categoryList}>
                      {categories.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                  </>
                )}
              </Field>
              <Toggle
                label="Pin to the top"
                description="Leads the Insights list and the home page ahead of newer articles."
                checked={doc.pinned}
                onChange={(pinned) => set({ pinned })}
              />
              <Field
                label="Web address"
                hint={
                  <>
                    /insights/<strong className="font-medium text-navy">{doc.slug || "…"}</strong>
                  </>
                }
              >
                {({ id, describedBy }) => (
                  <TextInput
                    id={id}
                    aria-describedby={describedBy}
                    value={doc.slug}
                    spellCheck={false}
                    autoComplete="off"
                    className="font-mono text-[0.8125rem]"
                    onChange={(event) => {
                      setSlugTouched(true);
                      set({
                        slug: slugify(event.target.value) || event.target.value.toLowerCase(),
                      });
                    }}
                  />
                )}
              </Field>
              <Toggle
                label="Work out the reading time"
                description={`About ${readingTimeOf(doc)} at the length it is now.`}
                checked={autoTime}
                onChange={setAutoTime}
              />
              {!autoTime ? (
                <Field label="Reading time">
                  {({ id, describedBy }) => (
                    <TextInput
                      id={id}
                      aria-describedby={describedBy}
                      value={doc.readingTime}
                      onChange={(event) => set({ readingTime: event.target.value })}
                    />
                  )}
                </Field>
              ) : null}
            </div>
          </Card>
        </div>
      </fieldset>
    </>
  );
}

export function newArticle(): ArticleDoc {
  return blankArticle("");
}

/* ── Body blocks ─────────────────────────────────────────────────────────── */

/* A project's stages, as the series' line names them (SeriesIndex.tsx). */
const SERIES_STAGES = [
  "Enquiry",
  "Feasibility",
  "Mock-Up",
  "Scope & Quotation",
  "Engineering",
  "Procurement",
  "Production",
  "Installation",
  "Inspection & Handover",
];

const SERIES_FIELD: FieldSpec = {
  kind: "optional",
  path: "",
  label: "Series",
  toggleLabel: "Part of the series",
  create: (): ArticleSeries => ({
    part: 1,
    kicker: "",
    at: 0,
    stage: "Enquiry",
    opening: "photo",
    openingLabel: "",
    openingNote: "",
    caption: "",
    focus: "50% 50%",
    pull: "",
  }),
  fields: [
    number("part", "Part number", { min: 1, max: 99, hint: "Its place in the series: 1, 2, 3…" }),
    text("kicker", "Line beside the number", { hint: "For example: Where it begins" }),
    {
      kind: "select",
      path: "stage",
      label: "Project stage",
      hint: "Named on the line across the top of the part.",
      options: SERIES_STAGES.map((stage) => ({ value: stage, label: stage })),
    },
    number("at", "Place on the project line", {
      min: 0,
      max: 1,
      step: 0.05,
      hint: "0 is the enquiry, 1 the handover.",
    }),
    {
      kind: "select",
      path: "opening",
      label: "Opening picture",
      hint: "The cover photograph, or a drawing on the blueprint ground.",
      options: [
        { value: "photo", label: "The cover photograph" },
        { value: "drawing", label: "A drawing" },
      ],
    },
    text("focus", "Part of the photograph to keep in view", {
      hint: "Across and down, for example 50% 40%.",
    }),
    text("openingLabel", "Label on the opening picture"),
    text("openingNote", "Note on the opening picture"),
    text("caption", "Caption under the opening picture", { wide: true }),
    area("pull", "Line quoted on the Insights page", { rows: 2 }),
  ],
};

type BlockKind = {
  type: ArticleBlock["type"];
  label: string;
  icon: ComponentType<LucideProps>;
  create: () => ArticleBlock;
  /** The block's form, for the kinds drawn by the form kit. The six plain
   *  kinds have their own, lighter controls (BlockBody). */
  fields?: FieldSpec[];
};

const points = (label: string) => strings("items", label, { addLabel: "Add Point", min: 1 });

/* Every kind of block the site can draw: the plain ones any article is
 * written in, then the laid-out pieces designed for the series
 * (components/durall/insights/seriesBlocks.tsx). */
const BLOCKS: BlockKind[] = [
  {
    type: "heading",
    label: "Heading",
    icon: Heading2,
    create: () => ({ type: "heading", text: "" }),
  },
  {
    type: "paragraph",
    label: "Paragraph",
    icon: Pilcrow,
    create: () => ({ type: "paragraph", text: "" }),
  },
  { type: "list", label: "List", icon: List, create: () => ({ type: "list", items: [""] }) },
  { type: "quote", label: "Quote", icon: Quote, create: () => ({ type: "quote", text: "" }) },
  {
    type: "image",
    label: "Image",
    icon: ImageIcon,
    create: () => ({ type: "image", photo: placeholderPhoto(), caption: "" }),
  },
  {
    type: "video",
    label: "Film",
    icon: Clapperboard,
    create: () => ({ type: "video", url: "", caption: "" }),
  },
  {
    type: "lead",
    label: "Opening Paragraph",
    icon: LetterText,
    create: () => ({ type: "lead", text: "" }),
    fields: [area("text", "The first paragraph, set large", { rows: 4 })],
  },
  {
    type: "callout",
    label: "Marked Paragraph",
    icon: TextQuote,
    create: () => ({ type: "callout", text: "" }),
    fields: [area("text", "A paragraph with a rule down its left side", { rows: 3 })],
  },
  {
    type: "statement",
    label: "Large Line",
    icon: Megaphone,
    create: () => ({ type: "statement", text: "", muted: "" }),
    fields: [
      text("text", "Line", { wide: true }),
      text("muted", "Second clause, set paler", { wide: true }),
    ],
  },
  {
    type: "figures",
    label: "Photographs Side by Side",
    icon: Images,
    create: () => ({
      type: "figures",
      items: [{ label: "", photo: placeholderPhoto(), caption: "" }],
    }),
    fields: [
      list<{ label: string }>(
        "items",
        "Photographs",
        [text("label", "Label above"), text("caption", "Caption"), photo("photo", "Photograph")],
        (item) => item.label,
        { create: () => ({ label: "", photo: placeholderPhoto(), caption: "" }), max: 4 },
      ),
    ],
  },
  {
    type: "checks",
    label: "Numbered Points",
    icon: ListChecks,
    create: () => ({ type: "checks", items: [""] }),
    fields: [points("Points, as numbered tiles")],
  },
  {
    type: "cards",
    label: "Numbered Cards",
    icon: LayoutGrid,
    create: () => ({ type: "cards", items: [{ title: "", body: "" }] }),
    fields: [
      list<{ title: string }>(
        "items",
        "Cards",
        [text("title", "Title"), area("body", "Text", { rows: 2 })],
        (item) => item.title,
        { create: () => ({ title: "", body: "" }), max: 12 },
      ),
    ],
  },
  {
    type: "steps",
    label: "Stages on a Line",
    icon: Milestone,
    create: () => ({ type: "steps", items: [""] }),
    fields: [strings("items", "Stages, in order", { addLabel: "Add Stage", min: 1 })],
  },
  {
    type: "ticks",
    label: "Ticked Points",
    icon: CheckCheck,
    create: () => ({ type: "ticks", items: [""] }),
    fields: [points("Points, each with a tick")],
  },
  {
    type: "split",
    label: "Photograph and List",
    icon: Columns2,
    create: () => ({
      type: "split",
      photo: placeholderPhoto(),
      caption: "",
      intro: "",
      items: [""],
    }),
    fields: [
      photo("photo", "Photograph"),
      text("caption", "Caption", { wide: true }),
      text("intro", "Line above the list", { wide: true }),
      points("Points, numbered"),
    ],
  },
  {
    type: "bars",
    label: "Bars Compared",
    icon: ChartBar,
    create: () => ({
      type: "bars",
      title: "",
      rows: [{ label: "", value: "", share: 0.5 }],
      ticks: [],
    }),
    fields: [
      text("title", "Title", { wide: true }),
      list<{ label: string }>(
        "rows",
        "Bars",
        [
          text("label", "Label"),
          text("value", "Figure shown at its end"),
          number("share", "Length", {
            min: 0,
            max: 1,
            step: 0.05,
            hint: "From 0 to 1 of the full width.",
          }),
        ],
        (item) => item.label,
        { create: () => ({ label: "", value: "", share: 0.5 }), max: 12 },
      ),
      strings("ticks", "Marks along the scale", { addLabel: "Add Mark" }),
    ],
  },
  {
    type: "diagram",
    label: "Diagram",
    icon: Workflow,
    create: () => ({ type: "diagram", name: "approval", title: "", alt: "" }),
    fields: [
      {
        kind: "select",
        path: "name",
        label: "Which diagram",
        hint: "The diagrams are drawn by the site; these are the two it has.",
        options: [
          { value: "approval", label: "The approval loop" },
          { value: "materials", label: "The flow of materials" },
        ],
      },
      text("title", "Title"),
      area("alt", "What it shows, for people who cannot see it", { rows: 2 }),
    ],
  },
  {
    type: "stages",
    label: "Stages to Step Through",
    icon: Route,
    create: () => ({ type: "stages", caption: "", items: [{ label: "", text: "", photo: null }] }),
    fields: [
      text("caption", "Caption", { wide: true }),
      list<{ label: string }>(
        "items",
        "Stages",
        [
          text("label", "Name"),
          area("text", "Text", { rows: 2 }),
          {
            kind: "optional",
            path: "photo",
            label: "Photograph",
            toggleLabel: "Has a photograph",
            create: placeholderPhoto,
            fields: [photo("", "Photograph")],
          },
        ],
        (item) => item.label,
        { create: () => ({ label: "", text: "", photo: null }), max: 12 },
      ),
    ],
  },
  {
    type: "closing",
    label: "Closing Line",
    icon: Flag,
    create: () => ({ type: "closing", text: "" }),
    fields: [area("text", "The last line, white on navy", { rows: 2 })],
  },
];
/** The kinds any article is written in; the rest are the series' own. */
const PLAIN = 6;

/**
 * The article body as a column of blocks, each moved with buttons rather
 * than dragged, so it works the same with a keyboard, a mouse or a phone.
 */
function BlockEditor({
  blocks,
  laidOut,
  onChange,
}: {
  blocks: ArticleBlock[];
  /** A part of the series: its page draws the laid-out pieces too. */
  laidOut: boolean;
  onChange: (next: ArticleBlock[]) => void;
}) {
  const update = (index: number, next: ArticleBlock) =>
    onChange(blocks.map((b, i) => (i === index ? next : b)));
  const insert = (index: number, type: ArticleBlock["type"]) => {
    const copy = [...blocks];
    copy.splice(index, 0, (BLOCKS.find((b) => b.type === type) ?? BLOCKS[1]!).create());
    onChange(copy);
  };
  const move = (from: number, to: number) => {
    const copy = [...blocks];
    const [block] = copy.splice(from, 1);
    copy.splice(to, 0, block!);
    onChange(copy);
  };

  return (
    <div className="grid gap-3">
      {blocks.length === 0 ? (
        <p className="text-sm text-slate">
          The article has no body yet. Add a heading or a paragraph to begin.
        </p>
      ) : null}
      <ol className="grid gap-3">
        {blocks.map((block, index) => {
          const meta = BLOCKS.find((b) => b.type === block.type) ?? BLOCKS[1]!;
          const Icon = meta.icon;
          return (
            <li
              key={index}
              className={cn(
                "rounded-xl border border-navy/10 bg-white",
                block.type === "heading" && index > 0 && "mt-3 border-navy/20",
              )}
            >
              <div className="flex items-center justify-between gap-2 border-b border-navy/8 py-1 pr-1 pl-3">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-slate">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {meta.label}
                </span>
                <div className="flex">
                  <IconButton
                    label={`Move ${meta.label.toLowerCase()} up`}
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label={`Move ${meta.label.toLowerCase()} down`}
                    disabled={index === blocks.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label={`Remove ${meta.label.toLowerCase()}`}
                    onClick={() => onChange(blocks.filter((_, i) => i !== index))}
                    className="hover:text-[#b42318]"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                </div>
              </div>
              <div className="p-3">
                {meta.fields ? (
                  <FieldGrid
                    fields={meta.fields}
                    value={block}
                    onChange={(next) => update(index, next as ArticleBlock)}
                  />
                ) : (
                  <BlockBody block={block} onChange={(next) => update(index, next)} />
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="grid gap-1 rounded-xl border border-dashed border-navy/15 p-2">
        {[
          { name: "Add", kinds: BLOCKS.slice(0, PLAIN) },
          // Only a part of the series has a page that draws these.
          { name: "Add a laid-out piece", kinds: laidOut ? BLOCKS.slice(PLAIN) : [] },
        ]
          .filter((group) => group.kinds.length)
          .map((group) => (
            <div key={group.name} className="flex flex-wrap items-center gap-2">
              <span className="px-2 text-xs text-slate">{group.name}</span>
              {group.kinds.map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  size="sm"
                  variant="ghost"
                  onClick={() => insert(blocks.length, type)}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {label}
                </Button>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}

function BlockBody({
  block,
  onChange,
}: {
  block: ArticleBlock;
  onChange: (next: ArticleBlock) => void;
}) {
  switch (block.type) {
    case "heading":
      return (
        <TextInput
          aria-label="Heading"
          value={block.text}
          autoComplete="off"
          placeholder="Section heading…"
          onChange={(event) => onChange({ ...block, text: event.target.value })}
          className="font-display text-base font-medium"
        />
      );
    case "paragraph":
    case "quote":
      return (
        <TextArea
          aria-label={block.type === "quote" ? "Quote" : "Paragraph"}
          value={block.text}
          rows={block.type === "quote" ? 2 : 4}
          placeholder={
            block.type === "quote" ? "A line worth pulling out…" : "Write the paragraph…"
          }
          onChange={(event) => onChange({ ...block, text: event.target.value })}
          className={block.type === "quote" ? "font-serif text-base italic" : ""}
        />
      );
    case "list":
      return (
        <FieldControl
          spec={{
            kind: "strings",
            path: "",
            label: "Points",
            item: "text",
            addLabel: "Add Point",
            min: 1,
          }}
          value={block.items}
          onChange={(items) => onChange({ ...block, items: items as string[] })}
        />
      );
    case "image":
      return (
        <div className="grid gap-4">
          <PhotoField
            label="Image"
            value={block.photo}
            onChange={(photo) => onChange({ ...block, photo })}
          />
          <Field label="Caption (optional)">
            {({ id, describedBy }) => (
              <TextInput
                id={id}
                aria-describedby={describedBy}
                value={block.caption}
                onChange={(event) => onChange({ ...block, caption: event.target.value })}
              />
            )}
          </Field>
        </div>
      );
    case "video":
      return (
        <div className="grid gap-4">
          <Field label="Film link" hint="A YouTube or Vimeo address." error={videoError(block.url)}>
            {({ id, describedBy }) => (
              <TextInput
                id={id}
                aria-describedby={describedBy}
                type="url"
                inputMode="url"
                spellCheck={false}
                autoComplete="off"
                placeholder="https://vimeo.com/…"
                value={block.url}
                onChange={(event) => onChange({ ...block, url: event.target.value.trim() })}
              />
            )}
          </Field>
          <Field label="Caption (optional)">
            {({ id, describedBy }) => (
              <TextInput
                id={id}
                aria-describedby={describedBy}
                value={block.caption}
                onChange={(event) => onChange({ ...block, caption: event.target.value })}
              />
            )}
          </Field>
        </div>
      );
    default:
      return null;
  }
}

/** The message for a film link the site cannot play, or none. */
function videoError(url: string): string | null {
  if (!url) return null;
  return embedOf(url) ? null : "Paste a YouTube or Vimeo address. Other links cannot be played.";
}
