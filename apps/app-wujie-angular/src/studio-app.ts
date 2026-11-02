import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
} from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
  selector: "studio-app",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: "./shell.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudioApp {
  readonly navMatch = {
    paths: "exact",
    queryParams: "ignored",
    fragment: "ignored",
    matrixParams: "ignored",
  } as const;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  focusMain(event: Event) {
    event.preventDefault();
    this.element.nativeElement.querySelector<HTMLElement>("main")?.focus();
  }
}
