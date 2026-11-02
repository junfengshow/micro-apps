import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  type ValidatorFn,
} from "@angular/forms";
import { RouterLink } from "@angular/router";

@Component({
  selector: "studio-home",
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./home.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {}
@Component({
  selector: "studio-products",
  standalone: true,
  templateUrl: "./products.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPage {}
@Component({
  selector: "studio-solutions",
  standalone: true,
  templateUrl: "./solutions.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolutionsPage {}
@Component({
  selector: "studio-about",
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./about.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {}

const nonBlank: ValidatorFn = (control) =>
  typeof control.value === "string" && control.value.trim()
    ? null
    : { required: true };

@Component({
  selector: "studio-contact",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./contact.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage {
  readonly form = new FormGroup({
    name: new FormControl("", { nonNullable: true, validators: [nonBlank] }),
    email: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    message: new FormControl("", { nonNullable: true, validators: [nonBlank] }),
  });
  readonly attempted = signal(false);
  readonly submitted = signal(false);
  submit() {
    this.attempted.set(true);
    this.form.markAllAsTouched();
    this.submitted.set(this.form.valid);
  }
}
