import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Luv2ShopFormService } from '../../services/luv2-shop-form.service';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { Luv2ShopValidators } from '../../validators/luv2-shop-validators';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { Router } from '@angular/router';
import { Order } from '../../common/order';
import { OrderItem } from '../../common/order-item';
import { Purchase } from '../../common/purchase';
import { Address } from '../../common/address';
import { Customer } from '../../common/customer';

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

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(
    private fb: FormBuilder,
    private luv2ShopService: Luv2ShopFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) {}

  setUpAddress() {
    return this.fb.group({
      street: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Luv2ShopValidators.notOnlyWhiteSpace,
      ]),
      city: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Luv2ShopValidators.notOnlyWhiteSpace,
      ]),
      state: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      zipCode: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Luv2ShopValidators.notOnlyWhiteSpace,
      ]),
    });
  }
  ngOnInit(): void {
    this.reviewCardDetails();

    this.checkoutFormGroup = this.fb.group({
      customer: this.fb.group({
        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhiteSpace,
        ]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhiteSpace,
        ]),
        email: new FormControl('', [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ]),
      }),
      shippingAddress: this.setUpAddress(),
      billingAddress: this.setUpAddress(),
      creditCard: this.fb.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhiteSpace,
        ]),
        cardNumber: new FormControl('', [
          Validators.required,
          Validators.pattern('[0-9]{16}'),
        ]),
        securityCode: new FormControl('', [
          Validators.required,
          Validators.pattern('[0-9]{3}'),
        ]),
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

    // populate countries
    this.luv2ShopService
      .getCountries()
      .subscribe((data) => (this.countries = data));
  }

  onSubmit() {
    // console.log(this.checkoutFormGroup.get('customer')?.value);
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    let order: Order = {
      totalPrice: this.totalPrice,
      totalQuantity: this.totalQuantity,
    };

    const cartItems = this.cartService.cartItems;
    let orderItems: OrderItem[] = cartItems.map((item) => new OrderItem(item));

    let shippingAddress: Address =
      this.checkoutFormGroup.get('shippingAddress')?.value;
    let billingAddress: Address =
      this.checkoutFormGroup.get('billingAddress')?.value;

    let customer: Customer = this.checkoutFormGroup.get('customer')?.value;

    const shippingState: State = JSON.parse(
      JSON.stringify(shippingAddress.state)
    );
    const shippingCountry: Country = JSON.parse(
      JSON.stringify(shippingAddress.country)
    );

    const billingState: State = JSON.parse(
      JSON.stringify(billingAddress.state)
    );

    const billingCountry: Country = JSON.parse(
      JSON.stringify(billingAddress.country)
    );

    let purchase: Purchase = {
      customer,
      order,
      orderItems,
      shippingAddress: {
        ...shippingAddress,
        state: shippingState.name,
        country: shippingCountry.name,
      },
      billingAddress: {
        ...billingAddress,
        state: billingState.name,
        country: billingCountry.name,
      },
    };

    this.checkoutService.placeOrder(purchase).subscribe({
      next: (res) => {
        alert(
          `Your order has been received. \n Order Tracking number: ${res.orderTrackingNumber}`
        );
        this.resetCart();
      },
      error: (err) => {
        alert(`There was an error:${err.message}`);
      },
    });
  }

  get firstName() {
    return this.checkoutFormGroup.get('customer.firstName');
  }

  get lastName() {
    return this.checkoutFormGroup.get('customer.lastName');
  }

  get email() {
    return this.checkoutFormGroup.get('customer.email');
  }

  get shippingAddressStreet() {
    return this.checkoutFormGroup.get('shippingAddress.street');
  }
  get shippingAddressCity() {
    return this.checkoutFormGroup.get('shippingAddress.city');
  }
  get shippingAddressState() {
    return this.checkoutFormGroup.get('shippingAddress.state');
  }
  get shippingAddressCountry() {
    return this.checkoutFormGroup.get('shippingAddress.country');
  }
  get shippingAddressZipCode() {
    return this.checkoutFormGroup.get('shippingAddress.zipCode');
  }

  get billingAddressStreet() {
    return this.checkoutFormGroup.get('billingAddress.street');
  }
  get billingAddressCity() {
    return this.checkoutFormGroup.get('billingAddress.city');
  }
  get billingAddressState() {
    return this.checkoutFormGroup.get('billingAddress.state');
  }
  get billingAddressCountry() {
    return this.checkoutFormGroup.get('billingAddress.country');
  }
  get billingAddressZipCode() {
    return this.checkoutFormGroup.get('billingAddress.zipCode');
  }

  get creditCardType() {
    return this.checkoutFormGroup.get('creditCard.cardType');
  }
  get creditCardNameOnCard() {
    return this.checkoutFormGroup.get('creditCard.nameOnCard');
  }
  get creditCardNumber() {
    return this.checkoutFormGroup.get('creditCard.cardNumber');
  }
  get creditCardSecurityCode() {
    return this.checkoutFormGroup.get('creditCard.securityCode');
  }
  get creditCardExpMonth() {
    return this.checkoutFormGroup.get('creditCard.expirationMonth');
  }
  get creditCardExpYear() {
    return this.checkoutFormGroup.get('creditCard.expirationYear');
  }

  copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup
        .get('billingAddress')
        ?.setValue(this.checkoutFormGroup.get('shippingAddress')?.value);

      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.get('billingAddress')?.reset();
      this.billingAddressStates = [];
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

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.get('country')?.value.code;
    const countryName = formGroup?.get('country')?.value.name;

    this.luv2ShopService.getStates(countryCode).subscribe((data) => {
      if (formGroupName === 'shippingAddress') {
        this.shippingAddressStates = data;
      } else {
        this.billingAddressStates = data;
      }

      // select first item by default
      formGroup?.get('state')?.setValue(data[0]);
    });
  }

  reviewCardDetails() {
    this.cartService.totalQuantity.subscribe(
      (data) => (this.totalQuantity = data)
    );
    this.cartService.totalPrice.subscribe((data) => (this.totalPrice = data));
  }

  resetCart() {
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.checkoutFormGroup.reset();
    this.router.navigateByUrl('/products');
  }
}
