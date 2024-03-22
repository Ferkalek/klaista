import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IItem } from '../../interfaces/list.interface';
import { MainService } from '../../service/main.service';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { map } from 'rxjs';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemComponent {
  @Input() set item(value: IItem) {
    if (value) {
      this.form = this.fb.group({
        id: new FormControl(value.id),
        status: new FormControl(value.status),
        text: new FormControl(value.text, [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ]),
      });
    }
  }

  isEditMode = false;
  previousValue = '';

  isOwner$ = this.service.listId$.pipe(map((v) => !v));

  form: FormGroup;

  constructor(private fb: FormBuilder, private service: MainService) {}

  get id(): AbstractControl | null {
    return this.form.get('id');
  }

  get text(): AbstractControl | null {
    return this.form.get('text');
  }

  onSelect(): void {
    this.service.changeStatus(this.form.value);
  }

  onDelete(): void {
    this.service.deleteItem(this.id?.value);
  }

  changeOnEditMode(input: HTMLInputElement): void {
    this.isEditMode = true;
    this.previousValue = this.text?.value;

    setTimeout(() => input.focus());

    if (this.service.isEditable$.value) {
      this.service.isEditable$.next(false);
      this.service.resetForm$.next();
    }
  }

  onSave(): void {
    this.isEditMode = false;

    if (this.form.invalid) {
      this.text?.setValue(this.previousValue);
    } else {
      this.service.editItem(this.form.value);
    }
  }

  onKeydown(event: { key: string }): void {
    if (event.key === 'Enter') {
      this.onSave();
    }
  }
}
