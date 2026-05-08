import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { CustomerInterface } from '../../../core/interfaces/customer';
import { RouteInterface } from '../../../core/interfaces/route';
import { PaymentMethodInterface } from '../../../core/interfaces/payment-method';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';
import { CustomersService } from '../../../core/services/customers.service';
import { AddressesService } from '../../../core/services/addresses.service';
import { RoutesService } from '../../../core/services/routes.service';
import { PaymentMethodsService } from '../../../core/services/payment-methods.service';
import { SubscriptionPlansService } from '../../../core/services/subscription-plans.service';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { UsersService } from '../../../core/services/users.service';
import { RolesService } from '../../../core/services/roles.service';
import { UserRolesCompanyService } from '../../../core/services/user-roles-company.service';
import { AddressInterface } from '../../../core/interfaces/address';
import { SubscriptionPlanInterface } from '../../../core/interfaces/subscription-plan';

@Component({
  selector: 'app-customer',
  imports: [
    RouterLink,
    FormsModule,
    HeaderComponent,
    PageNavTabsComponent
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent {

  public customer!: CustomerInterface;
  public routes: RouteInterface[] = [];
  public paymentMethods: PaymentMethodInterface[] = [];
  public subscriptionsPlans: SubscriptionPlanInterface[] = [];
  public cus_subscriptionplanbycustomer: boolean = true;
  public isLoading: boolean = false;
  public createSystemUser: boolean = false;
  public automatedUserNick: string = '';
  public nickStatus: 'none' | 'checking' | 'available' | 'taken' = 'none';
  public emailStatus: 'none' | 'checking' | 'available' | 'taken' = 'none';
  private isNickManual: boolean = false;
  private nickSubject = new Subject<string>();
  private emailSubject = new Subject<string>();
  public currentYear: number = new Date().getFullYear();
  public headerConfig: any = {};
  public dataTabs: any = [
    {
      url: ['/admin/user/customer', 'new'],
      icon: "fas fa-plus fa-fw",
      title: "AGREGAR CLIENTE"
    },
    {
      url: ['/admin/user/customers'],
      icon: "fas fa-clipboard-list fa-fw",
      title: "LISTA DE CLIENTES"
    },
    {
      url: ['/admin/user/customers-order'],
      icon: "fas fa-sort fa-fw",
      title: "ORDEN DE CLIENTES"
    },
    {
      url: ['/admin/user/customer-works'],
      icon: "fas fa-briefcase fa-fw",
      title: "TRABAJOS POR CLIENTE"
    }
  ]

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _sessionService: SessionService,
    private _messageService: MessageService,
    private _customersService: CustomersService,
    private _addressesService: AddressesService,
    private _routesService: RoutesService,
    private _paymentMethodsService: PaymentMethodsService,
    private _subscriptionPlansService: SubscriptionPlansService,
    private _sharedDataService: SharedDataService,
    private _usersService: UsersService,
    private _rolesService: RolesService,
    private _userRolesCompanyService: UserRolesCompanyService
  ) {
    this.isLoading = false;
    this.customerInit();
    this.initNickValidation();
    this.initEmailValidation();
  }

  private initNickValidation(): void {
    this.nickSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(nick => {
      this.performNickCheck(nick);
    });
  }

  private initEmailValidation(): void {
    this.emailSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(email => {
      this.performEmailCheck(email);
    });
  }

  ngOnInit(): void {
    this.customer.cmp_uuid = this._sessionService.getCompany().cmp_uuid;
    this.getRoutes(this.customer.cmp_uuid!);
    this.getPaymentMethods(this.customer.cmp_uuid!);
    this.getSubscriptionsPlans(this.customer.cmp_uuid!);

    this._route.params.subscribe((params) => {
      if (params['cus_uuid'] && params['cus_uuid'] != 'new') {
        this.headerConfig = {
          title: "ACTUALIZAR CLIENTE",
          description: "Ficha para actualizar un Cliente.",
          icon: "fas fa-sync-alt fa-fw"
        }
        this.customer.cus_uuid = params['cus_uuid'];
        this.getCustomerById(this.customer.cmp_uuid!, params['cus_uuid']);
      } else {
        this.headerConfig = {
          title: "AGREGAR CLIENTE",
          description: "Ficha para agregar un Cliente.",
          icon: "fas fa-plus fa-fw"
        }
      }
    });

    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if (company) {
        console.info(company);
        this.customer.cmp_uuid = company.cmp_uuid;
        this.getCustomerById(this.customer.cmp_uuid!, this.customer.cus_uuid!);
      }
    });
  }

  public customerInit(): void {
    this.customer = {
      cmp_uuid: null,
      cus_uuid: 'new',
      cus_fullname: null,
      cus_email: null,
      cus_phone: null,
      cus_dateofbirth: null,
      rou_uuid: null,
      rou: null,
      pmt_uuid: null,
      usr_uuid: null,
      cus_subscriptionplanbycustomer: false,
      subp_uuid: null,
      subp: null,
      cus_createdat: null,
      cus_updatedat: null,
      cus_active: true,
      cus_order: null
    };
    this.automatedUserNick = '';
    this.isNickManual = false;
    this.nickStatus = 'none';
    this.emailStatus = 'none';
  }

  private verifySubscriptionPlan(addresses: any): void {
    if (addresses && addresses.length) {
      this.cus_subscriptionplanbycustomer = !addresses.every((item: any) =>
        item.subp_uuid && item.subp_uuid.trim() !== ''
      );
    } else {
      this.cus_subscriptionplanbycustomer = true;
    }
  }

  private getAdresses(cmp_uuid: string, cus_uuid: string) {
    this._addressesService.getAddresses(cmp_uuid, cus_uuid).subscribe(
      (response: any) => {
        if (response.success) {
          console.info(response.data);
          this.customer.addresses = response.data;
        } else {
          //this.status = 'error'
        }
        this.verifySubscriptionPlan(this.customer.addresses);
      },
      (error: any) => {
        let errorMessage = <any>error;
        console.log(errorMessage);
        if (errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  private getCustomerById(cmp_uuid: string, cus_uuid: string): void {
    this._customersService.getCustomerById(cmp_uuid, cus_uuid).subscribe(
      (response: any) => {
        if (response.success) {
          console.info(response.data);
          this.customer = response.data;
          this.getAdresses(this.customer.cmp_uuid!, this.customer.cus_uuid!);
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        let errorMessage = <any>error;
        console.log(errorMessage);

        if (errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  private getRoutes(cmp_uuid: string) {
    this._routesService.getRoutes(cmp_uuid).subscribe(
      (response: any) => {
        if (response.success) {
          console.info(response.data);
          this.routes = response.data;
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        let errorMessage = <any>error;
        console.log(errorMessage);

        if (errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  private getPaymentMethods(cmp_uuid: string) {
    this._paymentMethodsService.getPaymentMethods(cmp_uuid).subscribe(
      (response: any) => {
        if (response.success) {
          console.info(response.data);
          this.paymentMethods = response.data;
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        let errorMessage = <any>error;
        console.log(errorMessage);

        if (errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  private getSubscriptionsPlans(cmp_uuid: string) {
    this._subscriptionPlansService.getSubscriptionsPlans(cmp_uuid).subscribe(
      (response: any) => {
        if (response.success) {
          console.info(response.data);
          this.subscriptionsPlans = response.data;
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        let errorMessage = <any>error;
        console.log(errorMessage);

        if (errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  public addAddress(formCustomer: NgForm): void {
    if (this.customer.cus_uuid === 'new') {
      if (this.validate()) {
        this._messageService.showCustomMessage({
          title: "Guardar cliente necesario",
          text: "Para agregar una dirección primero debemos registrar al cliente. ¿Deseas guardarlo ahora y continuar?",
          type: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, guardar y agregar dirección",
          cancelButtonText: "No, cancelar"
        }, (result: any) => {
          if (result.value) {
            this.insertCustomer(formCustomer, true);
          }
        });
      }
    } else {
      this._router.navigate(['/admin/user/address', this.customer.cus_uuid, 'new', this.customer.cus_subscriptionplanbycustomer]);
    }
  }

  public onRouteChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedRoute = this.routes.find(
      (selectedRoute: RouteInterface) => selectedRoute.rou_uuid === selectedValue
    );
    if (selectedRoute) {
      //this.setModelItem(selectedPaymentMethod);
    }
  }

  public onPaymentMethodChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedPaymentMethod = this.paymentMethods.find(
      (selectedPaymentMethod: PaymentMethodInterface) => selectedPaymentMethod.pmt_uuid === selectedValue
    );
    if (selectedPaymentMethod) {
      //this.setModelItem(selectedPaymentMethod);
    }
  }

  public onSubscriptionPlanChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedSubscriptionPlan = this.subscriptionsPlans.find(
      (selectedSubscriptionPlan: SubscriptionPlanInterface) => selectedSubscriptionPlan.subp_uuid === selectedValue
    );
    if (selectedSubscriptionPlan) {
      //this.setModelItem(selectedSubscriptionPlan);
    }
  }

  public onFullNameChange(name: string): void {
    if (this.customer.cus_uuid === 'new' && !this.isNickManual) {
      this.automatedUserNick = this.generateNick(name);
      this.checkNickAvailability();
    }
  }

  public onNickChange(): void {
    this.isNickManual = true;
    this.checkNickAvailability();
  }

  public onEmailChange(): void {
    this.checkEmailAvailability();
  }

  private generateNick(name: string): string {
    if (!name) return '';
    return name.toLowerCase()
      .trim()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 50);
  }

  private checkNickAvailability(): void {
    if (!this.automatedUserNick || this.automatedUserNick.length < 3) {
      this.nickStatus = 'none';
      return;
    }
    this.nickStatus = 'checking';
    this.nickSubject.next(this.automatedUserNick);
  }

  private performNickCheck(nick: string): void {
    this._usersService.userNickExist(nick).subscribe(
      (response: any) => {
        if (response.success && response.data) {
          this.nickStatus = 'taken';
        } else {
          this.nickStatus = 'available';
        }
      },
      error => {
        console.error('Error checking nick availability', error);
        this.nickStatus = 'none';
      }
    );
  }

  private checkEmailAvailability(): void {
    const email = this.customer.cus_email;
    if (!email || email.length < 3 || !email.includes('@')) {
      this.emailStatus = 'none';
      return;
    }
    this.emailStatus = 'checking';
    this.emailSubject.next(email);
  }

  private performEmailCheck(email: string): void {
    this._usersService.userEmailExist(email).subscribe(
      (response: any) => {
        if (response.success && response.data) {
          this.emailStatus = 'taken';
        } else {
          this.emailStatus = 'available';
        }
      },
      error => {
        console.error('Error checking email availability', error);
        this.emailStatus = 'none';
      }
    );
  }

  private validate(): boolean {
    if (!this.customer.cus_fullname) {
      this._messageService.error(
        "Error",
        "El nombre de cliente no puede estar vacio."
      );
      return false;
    }

    if ((this.createSystemUser && this.nickStatus === 'taken') || this.emailStatus === 'taken') {
      this._messageService.error(
        "Error",
        "El nombre de usuario o email ya está en uso. Por favor elija otro."
      );
      return false;
    }

    if (this.createSystemUser && !this.automatedUserNick) {
      this._messageService.error(
        "Error",
        "El nombre de usuario es obligatorio si desea crear un acceso digital."
      );
      return false;
    }

    if (this.customer.cus_fullname.length > 255) {
      this._messageService.error(
        "Error",
        "El nombre no puede superar los 255 caracteres."
      );
      return false;
    }

    if (this.customer.cus_email && this.customer.cus_email.length > 255) {
      this._messageService.error(
        "Error",
        "El email no puede superar los 255 caracteres."
      );
      return false;
    }

    if (this.customer.cus_phone && this.customer.cus_phone.length > 20) {
      this._messageService.error(
        "Error",
        "El telefono no puede superar los 20 caracteres."
      );
      return false;
    }

    if (this.customer.cus_subscriptionplanbycustomer && !this.customer.subp_uuid) {
      this._messageService.error(
        "Error",
        "Selecciono plan por cliente y no selecciono un plan."
      );
      return false;
    }

    if (!this.customer.cus_subscriptionplanbycustomer && this.customer.subp_uuid) {
      this._messageService.error(
        "Error",
        "Selecciono un plan y no habilito plan por cliente."
      );
      return false;
    }

    return true;
  }

  private async updateCustomer(formCustomer: NgForm, redirectToAddress: boolean = false): Promise<void> {
    this.isLoading = true;

    //Valido fechas
    let customer = formCustomer.form.value
    customer.cus_dateofbirth = (customer.cus_dateofbirth && customer.cus_dateofbirth.indexOf("-") != -1 ? customer.cus_dateofbirth : null);

    this._customersService.updateCustomer(customer).subscribe(
      response => {
        if (response.success) {
          this.isLoading = false;
          const customer = response.customer;
          this._messageService.success(
            "Informacion",
            "El Cliente fue actualizado correctamente.",
            () => {
              if (redirectToAddress && response.customer) {
                this._router.navigate(['/admin/user/address', response.customer.cus_uuid, 'new', this.customer.cus_subscriptionplanbycustomer]);
              } else {
                this._router.navigate(['/admin/user/customers']);
              }
            }
          );
        } else {
          this.isLoading = false;
          //this.status = 'error'
        }
      },
      error => {
        this.isLoading = false;
        let errorMessage = <any>error;
        console.log(errorMessage);
        if (errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  private async insertCustomer(formCustomer: NgForm, redirectToAddress: boolean = false): Promise<void> {
    this.isLoading = true;

    //Valido fechas
    let customer = formCustomer.form.value
    customer.cus_dateofbirth = (customer.cus_dateofbirth && customer.cus_dateofbirth.indexOf("-") != -1 ? customer.cus_dateofbirth : null);

    this._customersService.saveCustomer(customer).subscribe(
      async (response: any) => {
        if (response.success) {
          this.isLoading = false;
          // El API debería retornar el cliente creado
          const createdCustomer = response.data;
          
          if (this.createSystemUser && createdCustomer) {
            await this.createAutomatedUser(createdCustomer);
          }

          this._messageService.success(
            "Información",
            "El Cliente fue agregado correctamente.",
            () => {
              if (redirectToAddress && createdCustomer) {
                this._router.navigate(['/admin/user/address', createdCustomer.cus_uuid, 'new', this.customer.cus_subscriptionplanbycustomer]);
              } else {
                this._router.navigate(['/admin/user/customers']);
              }
            }
          );
        } else {
          this.isLoading = false;
        }
      },
      error => {
        this.isLoading = false;
        let errorMessage = <any>error;
        console.log(errorMessage);
        if (errorMessage != null) {
          this._messageService.error(
            "Error",
            errorMessage.error.error
          );
        }
      }
    )
  }

  private async createAutomatedUser(customer: CustomerInterface): Promise<void> {
    const currentYear = this.currentYear;
    // Usar el nick validado manualmente
    const nick = this.automatedUserNick || this.generateNick(customer.cus_fullname || '');
    const password = `${nick}${currentYear}`;

    const newUser = {
      usr_name: customer.cus_fullname?.split(' ')[0] || customer.cus_fullname,
      usr_surname: customer.cus_fullname?.split(' ').slice(1).join(' ') || '',
      usr_email: customer.cus_email,
      usr_nick: nick,
      usr_password: password,
      usr_confirmed: true
    };

    try {
      // Registro de usuario
      const userResponse: any = await this._usersService.saveUser(newUser).toPromise();
      if (userResponse && userResponse.user) {
        const usr_uuid = userResponse.user.usr_uuid;

        // Buscar Rol "Cliente" (asumimos que existe)
        const rolesResponse: any = await this._rolesService.getRoles('all').toPromise();
        const clientRole = rolesResponse?.data?.find((r: any) => 
          r.rol_name.toLowerCase().includes('client') || r.rol_name.toLowerCase().includes('cliente')
        );

        if (clientRole) {
          await this._userRolesCompanyService.insertUserRolCompany({
            usr_uuid: usr_uuid,
            rol_uuid: clientRole.rol_uuid,
            cmp_uuid: customer.cmp_uuid
          }).toPromise();
        }

        // Vincular el usr_uuid al registro del cliente
        customer.usr_uuid = usr_uuid;
        await this._customersService.updateCustomer(customer).toPromise();
        console.info('Acceso digital creado exitosamente para el cliente');
      }
    } catch (error) {
      console.error('Error en creación automatizada:', error);
      this._messageService.error("Aviso", "El cliente se creó, pero no se pudo generar su acceso digital automáticamente.");
    }
  }

  public onSaveCustomer(formCustomer: NgForm): void {
    if (this.validate()) {
      if (this.customer.cus_uuid && this.customer.cus_uuid != 'new') {
        this.updateCustomer(formCustomer);
      } else {
        this.insertCustomer(formCustomer);
      }
    }
  }

  public deleteAddress(address: AddressInterface) {
    this._messageService.showCustomMessage({
      title: "¿Estás seguro de eliminar la Direccion?",
      type: "question",
      text: "Estás a punto de eliminar la Direccion.",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: "Sí, eliminar!",
      cancelButtonText: "No, cancelar"
    },
      (result: any) => {
        if (result.value) {
          this._addressesService.deleteAddress(address.cmp_uuid!, address.cus_uuid!, address.adr_uuid!)
            .subscribe(
              response => {
                console.info(response);
                this.getAdresses(address.cmp_uuid!, address.cus_uuid!);
              },
              error => {
                this._messageService.error("Error", error.error.error || "Ocurrió un error al eliminar la dirección.");
              }
            );
        }
      }
    );
  }
}
