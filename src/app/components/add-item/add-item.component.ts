import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { Subject, map, takeUntil } from 'rxjs';
import { MainService } from '../../service/main.service';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddItemComponent implements OnInit {
  isOwner$ = this.service.key$.pipe(map((v) => !!v));
  isEditable$ = this.service.isEditable$;
  private unsubscribe$ = new Subject<void>();

  form = this.fb.group({
    item: new FormControl(null, [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
    ]),
  });

  constructor(
    private fb: FormBuilder,
    private service: MainService,
    private el: ElementRef
  ) {}

  get item(): AbstractControl | null {
    return this.form.get('item');
  }

  ngOnInit(): void {
    this.service.addItemInputFocused$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() =>
        setTimeout(() =>
          this.el.nativeElement
            .querySelector('[formcontrolname="item"]')
            .focus()
        )
      );

    this.service.resetForm$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => setTimeout(() => this.form.reset()));

    this.item?.statusChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((v) => this.service.addItemInvalid$.next(v === 'INVALID'));

    this.item?.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((v) => this.service.addItemValue$.next(v));
  }

  onKeydown(event: { key: string }): void {
    if (event.key !== 'Enter' || this.form.invalid) {
      return;
    }

    this.service.addItem({
      id: Date.now().toString(),
      text: this.item?.value,
      status: false,
    });

    this.form.reset();
  }

  onBlur(): void {
    if (!this.item?.value) {
      this.service.isEditable$.next(false);
    }
  }
}
