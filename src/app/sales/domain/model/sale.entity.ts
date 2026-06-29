import {BaseEntity} from '../../../shared/infrastructure/base-entity';
// @Embedded
// @AttributeOverride(name = "id", column = @Column(name = "staff_user_id"))
// private StaffUserId staffUserId;
//
// @Column(nullable = false)
// private double totalAmount;
//
//
// @OneToMany(
//   mappedBy = "sale",
//   cascade = CascadeType.ALL,
//   orphanRemoval = true
// )
// private List<SaleDetail> details = new ArrayList<>();
export class Sale implements BaseEntity {

  constructor(sale: {
    id: string;
    staffUserId: string;
    totalAmount: number;
  }) {
    this._id = sale.id;
    this._staffUserId = sale.staffUserId;
    this._totalAmount = sale.totalAmount;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  private _staffUserId: string
  get staffUserId(): string {
    return this._staffUserId;
  }

  set staffUserId(value: string) {
    this._staffUserId = value;
  }

  private _totalAmount: number;
  get totalAmount(): number {
    return this._totalAmount;
  }

  set totalAmount(value: number) {
    this._totalAmount = value;
  }
}
