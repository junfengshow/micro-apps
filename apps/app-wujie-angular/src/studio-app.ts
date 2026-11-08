import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { filter, map } from "rxjs";

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
  private readonly router = inject(Router);
  readonly showNavigation = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => !this.router.isActive("/angular", this.navMatch))
    ),
    { initialValue: !this.router.isActive("/angular", this.navMatch) }
  );
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  focusMain(event: Event) {
    event.preventDefault();
    this.element.nativeElement.querySelector<HTMLElement>("main")?.focus();
  }
}
