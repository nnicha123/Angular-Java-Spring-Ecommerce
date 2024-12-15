import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Luv2ShopFormService } from '../../services/luv2-shop-form.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  constructor(
    private fb: FormBuilder,
    private luv2ShopService: Luv2ShopFormService
  ) {}
  ngOnInit(): void {
    this.checkoutFormGroup = this.fb.group({
      customer: this.fb.group({
        firstName: [''],
        lastName: [''],
        email: [''],
      }),
      shippingAddress: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: [''],
      }),
      billingAddress: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: [''],
      }),
      creditCard: this.fb.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: [''],
      }),
    });

    // populate credit card months and years
    const startMonth: number = new Date().getMonth() + 1;
    this.luv2ShopService
      .getCreditCardMonths(startMonth)
      .subscribe((data) => (this.creditCardMonths = data));
    this.luv2ShopService
      .getCreditCardYears()
      .subscribe((data) => (this.creditCardYears = data));
  }

  onSubmit() {
    console.log(this.checkoutFormGroup.get('customer')?.value);
  }

  copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup
        .get('billingAddress')
        ?.setValue(this.checkoutFormGroup.get('shippingAddress')?.value);
    } else {
      this.checkoutFormGroup.get('billingAddress')?.reset();
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number =
      +creditCardFormGroup?.get('expirationYear')?.value;

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.luv2ShopService
      .getCreditCardMonths(startMonth)
      .subscribe((data) => (this.creditCardMonths = data));
  }
}
