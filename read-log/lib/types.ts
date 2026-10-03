export type ContentType = "article" | "pdf" | "youtube" | "podcast";
export type ReadStatus = "unread" | "read";
export type TextStatus = "ok" | "missing" | "needs_ocr";

export interface Summary {
  text: string;
  /** Hash des Inhalts, aus dem die Zusammenfassung erzeugt wurde. */
  contentHash: string;
  createdAt: string;
}

export interface Item {
  id: string;
  type: ContentType;
  title: string;
  source: string;
  url: string | null;
  normalizedUrl: string | null;
  contentHash: string;
  createdAt: string;
  tags: string[];
  status: ReadStatus;
  textStatus: TextStatus;
  /** Extrahierter Text als Absätze; Index = stabiler Textstellenbezug. */
  blocks: string[];
  /** Leseposition als Anteil 0..1. */
  readPosition: number;
  summary: Summary | null;
}

export type ItemListEntry = Omit<Item, "blocks"> & { excerpt: string };

export interface ListQuery {
  q?: string;
  type?: ContentType;
  tag?: string;
  status?: ReadStatus;
}

export interface Store {
  list(query: ListQuery): Promise<ItemListEntry[]>;
  get(id: string): Promise<Item | null>;
  findByUrl(normalizedUrl: string): Promise<Item | null>;
  findByHash(hash: string): Promise<Item | null>;
  create(item: Item): Promise<Item>;
  update(id: string, patch: Partial<Pick<Item, "title" | "tags" | "status" | "readPosition" | "summary">>): Promise<Item | null>;
  remove(id: string): Promise<boolean>;
}
