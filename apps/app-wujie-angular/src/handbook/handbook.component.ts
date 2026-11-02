import { DOCUMENT } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import {
  categories,
  filterEntries,
  type Category,
  type Entry,
} from "./content";

@Component({
  selector: "studio-handbook",
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: "./handbook.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HandbookComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  readonly categories = categories;
  readonly category = signal<Category>(categories[0]);
  readonly query = signal("");
  readonly group = signal("全部");
  readonly level = signal("全部难度");
  readonly levels = ["全部难度", "进阶", "高级", "专家"];
  readonly groups = computed(() => [
    "全部",
    ...new Set(this.category().entries.map((entry) => entry.group)),
  ]);
  readonly entries = computed(() =>
    filterEntries(
      this.category().entries,
      this.query(),
      this.group(),
      this.level()
    )
  );
  readonly copyMessage = signal("");
  readonly copiedId = signal("");
  readonly demoName = signal("Angular");
  readonly demoCount = signal(0);
  readonly doubled = computed(() => this.demoCount() * 2);

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.category.set(
        categories.find((item) => item.id === params.get("tab")) ||
          categories[0]
      );
      this.query.set(params.get("q") || "");
      const group = params.get("group") || "全部";
      this.group.set(this.groups().includes(group) ? group : "全部");
      const level = params.get("level") || "全部难度";
      this.level.set(
        this.category().id === "interview" && this.levels.includes(level)
          ? level
          : "全部难度"
      );
    });
    const shortcut = (event: KeyboardEvent) => {
      // composedPath 也覆盖被 Wujie 移入宿主 Shadow DOM 的输入框。
      const target = (event.composedPath()[0] ||
        event.target) as HTMLElement | null;
      if (
        event.key === "/" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !target?.closest?.("input, textarea, select, [contenteditable='true']")
      ) {
        event.preventDefault();
        this.document.getElementById("handbook-search")?.focus();
      }
    };
    this.document.addEventListener("keydown", shortcut);
    this.destroyRef.onDestroy(() =>
      this.document.removeEventListener("keydown", shortcut)
    );
  }
  select(category: Category) {
    this.category.set(category);
    this.copyMessage.set("");
    this.reset();
  }
  update(patch: { query?: string; group?: string; level?: string } = {}) {
    if (patch.query !== undefined) this.query.set(patch.query);
    if (patch.group !== undefined) this.group.set(patch.group);
    if (patch.level !== undefined) this.level.set(patch.level);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        tab: this.category().id,
        q: this.query() || undefined,
        group: this.group() === "全部" ? undefined : this.group(),
        level: this.level() === "全部难度" ? undefined : this.level(),
      },
    });
  }
  reset() {
    this.update({ query: "", group: "全部", level: "全部难度" });
  }
  increment() {
    this.demoCount.update((count) => count + 1);
  }
  async copy(entry: Entry) {
    let message: string;
    try {
      await this.document.defaultView!.navigator.clipboard.writeText(
        entry.code
      );
      message = "代码已复制";
    } catch {
      message = "复制不可用，请手动选择代码";
    }
    if (this.destroyRef.destroyed) return;
    this.copiedId.set(entry.id);
    this.copyMessage.set(message);
  }
}
