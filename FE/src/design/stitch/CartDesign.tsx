// Converted from gi_h_ng_c_a_b_n_smartphone_ai/code.html. Read-only design reference.
// Inline scripts were replaced by React state in src/pages and src/features.
export default function CartDesign() {
  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <header className={"fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-surface-variant transition-all duration-200"}>
        <div className={"h-[72px] max-w-[1280px] mx-auto px-gutter flex items-center justify-between"}>
          <div className={"flex items-center gap-space-lg"}>
            <a className={"flex items-center gap-space-sm group"} data-path={"trang-chu"} href={"#"}>
              <img alt={"SmartPhone AI Logo"} className={"h-8 w-auto object-contain"} src={"/images/c346f6d9e5d584cf.webp"} />
              <span className={"font-headline-sm text-headline-sm tracking-tight text-on-surface"}>
{"SmartPhone "}
                <span className={"text-secondary"}>
{"AI"}
                </span>
              </span>
            </a>
          </div>
          <nav className={"hidden md:flex items-center gap-space-xl"}>
            <a className={"font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors py-space-xs"} data-path={"trang-chu"} href={"#"}>
{"Trang chủ"}
            </a>
            <a className={"font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors py-space-xs"} data-path={"chi-tiet-san-pham"} href={"#"}>
{"Điện thoại"}
            </a>
            <a className={"font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors py-space-xs"} data-path={"chi-tiet-san-pham"} href={"#"}>
{"So sánh"}
            </a>
            <a className={"inline-flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors py-space-xs group"} data-path={"chon-chu-de-ai"} href={"#"}>
              <span className={"relative flex h-2 w-2"}>
                <span className={"animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"}>

                </span>
                <span className={"relative inline-flex rounded-full h-2 w-2 bg-secondary"}>

                </span>
              </span>
{"Tư vấn AI"}
              <span className={"px-1.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption uppercase tracking-wider"}>
{"Mới"}
              </span>
            </a>
          </nav>
          <div className={"flex items-center gap-space-md"}>
            <button aria-label={"Tìm kiếm thiết bị"} className={"w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"} type={"button"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"search"}
              </span>
            </button>
            <button aria-label={"Giỏ hàng"} className={"relative w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"} type={"button"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"shopping_bag"}
              </span>
              <span className={"absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-on-primary font-caption text-caption font-bold"}>
{"2"}
              </span>
            </button>
            <div className={"relative group pl-space-xs"}>
              <button className={"flex items-center gap-space-sm p-1 pr-2 rounded-full hover:bg-surface-container transition-all"} type={"button"}>
                <img alt={"Profile"} className={"w-8 h-8 rounded-full object-cover"} src={"/images/714dddc7bc860b08.webp"} />
                <span className={"hidden lg:block font-label-md text-label-md text-on-surface"}>
{"Minh Hoàng"}
                </span>
                <span className={"material-symbols-outlined text-outline text-[18px]"}>
{"expand_more"}
                </span>
              </button>
              <div className={"absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.1)] border border-surface-variant p-space-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50"}>
                <div className={"px-3 py-2 border-b border-surface-variant mb-1"}>
                  <p className={"font-label-sm text-label-sm text-on-surface-variant"}>
{"Đang đăng nhập"}
                  </p>
                  <p className={"font-label-md text-label-md text-on-surface font-semibold truncate"}>
{"minh.hoang@example.vn"}
                  </p>
                </div>
                <a className={"flex items-center gap-space-sm px-3 py-2 rounded-lg font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"} href={"#"}>
                  <span className={"material-symbols-outlined text-[18px]"}>
{"person"}
                  </span>
{"Tài khoản của tôi"}
                </a>
                <a className={"flex items-center gap-space-sm px-3 py-2 rounded-lg font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"} href={"#"}>
                  <span className={"material-symbols-outlined text-[18px]"}>
{"receipt_long"}
                  </span>
{"Đơn hàng của tôi"}
                </a>
                <a className={"flex items-center gap-space-sm px-3 py-2 rounded-lg font-body-sm text-body-sm text-secondary hover:bg-secondary-fixed/50 transition-colors"} data-path={"tro-ly-ai-va-xac-nhan-chuyen-chu-de"} href={"#"}>
                  <span className={"material-symbols-outlined text-[18px]"}>
{"auto_awesome"}
                  </span>
{"Lịch sử AI"}
                </a>
                <div className={"border-t border-surface-variant my-1"}>

                </div>
                <a className={"flex items-center gap-space-sm px-3 py-2 rounded-lg font-body-sm text-body-sm text-error hover:bg-error-container/30 transition-colors"} href={"#"}>
                  <span className={"material-symbols-outlined text-[18px]"}>
{"logout"}
                  </span>
{"Đăng xuất"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className={"w-full pt-[72px] bg-surface flex-1"}>
        <div className={"flex flex-col w-full"}>
          <div className={"relative w-full overflow-hidden pb-space-2xl"}>
            <div className={"absolute top-0 right-1/4 w-[480px] h-[480px] bg-secondary-fixed/30 rounded-full blur-[120px] pointer-events-none -z-10"}>

            </div>
            <div className={"absolute top-20 left-10 w-[360px] h-[360px] bg-primary-fixed/40 rounded-full blur-[100px] pointer-events-none -z-10"}>

            </div>
            <div className={"max-w-[1240px] mx-auto px-gutter w-full"}>
              <section className={"pt-space-lg pb-space-md"}>
                <nav aria-label={"Breadcrumb"} className={"flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant mb-space-sm"}>
                  <a className={"hover:text-primary transition-colors flex items-center gap-1"} href={"#"}>
                    <span className={"material-symbols-outlined text-[15px]"}>
{"home"}
                    </span>
{" Trang chủ "}
                  </a>
                  <span className={"text-outline-variant"}>
{"/"}
                  </span>
                  <span className={"text-on-surface font-semibold"}>
{"Giỏ hàng"}
                  </span>
                </nav>
                <div className={"flex flex-wrap items-baseline justify-between gap-space-md border-b-0 pb-2"}>
                  <div className={"flex items-center gap-space-sm"}>
                    <h1 className={"font-headline-lg text-headline-lg text-on-surface tracking-tight"}>
{"Giỏ hàng của bạn"}
                    </h1>
                    <span className={"px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface font-label-md text-label-md"} id={"header-item-count"}>
{" (2 sản phẩm) "}
                    </span>
                  </div>
                  <div className={"flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm"}>
                    <span className={"material-symbols-outlined text-[16px] text-[#16A34A]"} style={{"fontVariationSettings":"'FILL' 1"}}>
{"verified_user"}
                    </span>
{" Mua sắm bảo mật & kiểm tra hàng tận tay "}
                  </div>
                </div>
              </section>
              <div className={"grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start"}>
                <div className={"lg:col-span-8 flex flex-col gap-space-lg"}>
                  <div className={"bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg flex flex-col gap-space-xl"}>
                    <article className={"cart-item flex flex-col sm:flex-row gap-space-md sm:gap-space-lg p-space-md rounded-xl bg-surface-container-low/50 hover:bg-surface-container-low transition-all duration-200"} data-unit-price={"34990000"} id={"cart-item-1"}>
                      <div className={"w-full sm:w-36 h-36 rounded-xl bg-surface-container-lowest flex items-center justify-center p-2 shrink-0 relative overflow-hidden shadow-sm"}>
                        <img alt={"iPhone 16 Pro Max 256GB"} className={"w-full h-full object-contain"} data-alt={"High-end studio product photograph of Apple iPhone 16 Pro Max in Natural Titanium finish, ultra-crisp reflection on minimal alabaster surface, soft diffuse daylight, architectural high-tech aesthetic, subtle lavender undertones"} src={"/images/e3566a140abf8e56.webp"} />
                        <span className={"absolute top-2 left-2 px-1.5 py-0.5 rounded bg-surface text-on-surface font-caption text-caption"}>
{"Apple"}
                        </span>
                      </div>
                      <div className={"flex-1 flex flex-col justify-between gap-space-sm min-w-0"}>
                        <div className={"flex flex-col gap-1"}>
                          <div className={"flex items-start justify-between gap-2"}>
                            <h2 className={"font-headline-sm text-headline-sm text-on-surface truncate"}>
{"iPhone 16 Pro Max 256GB"}
                            </h2>
                            <span className={"font-headline-sm text-headline-sm text-on-surface font-semibold shrink-0"} id={"item-total-1"}>
{" 34.990.000₫ "}
                            </span>
                          </div>
                          <div className={"flex flex-wrap items-center gap-2 mt-0.5"}>
                            <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm"}>
                              <span className={"w-2.5 h-2.5 rounded-full bg-[#B8B4AE] shrink-0"}>

                              </span>
{" Màu: Titan Tự Nhiên "}
                            </span>
                            <span className={"px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm"}>
{" Dung lượng: 256GB "}
                            </span>
                          </div>
                          <div className={"flex items-center gap-1.5 text-on-surface-variant font-caption text-caption mt-1"}>
                            <span className={"material-symbols-outlined text-[15px] text-[#16A34A]"} style={{"fontVariationSettings":"'FILL' 1"}}>
{"check_circle"}
                            </span>
                            <span>
{"Bảo hành 12 tháng chính hãng Apple • Đổi trả 7 ngày"}
                            </span>
                          </div>
                        </div>
                        <div className={"flex flex-wrap items-center justify-between gap-space-sm pt-2"}>
                          <div className={"flex items-center rounded-lg bg-surface-container-lowest p-1 shadow-sm"}>
                            <button aria-label={"Giảm số lượng iPhone 16 Pro Max"} className={"qty-btn-minus w-8 h-8 rounded-md flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"} data-item={"1"} type={"button"}>
                              <span className={"material-symbols-outlined text-[16px]"}>
{"remove"}
                              </span>
                            </button>
                            <span className={"w-10 text-center font-label-md text-label-md font-semibold text-on-surface select-none"} id={"qty-val-1"}>
{"1"}
                            </span>
                            <button aria-label={"Tăng số lượng iPhone 16 Pro Max"} className={"qty-btn-plus w-8 h-8 rounded-md flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"} data-item={"1"} type={"button"}>
                              <span className={"material-symbols-outlined text-[16px]"}>
{"add"}
                              </span>
                            </button>
                          </div>
                          <div className={"flex items-center gap-space-md"}>
                            <button className={"favorite-btn inline-flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors"} data-active={"false"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"favorite_border"}
                              </span>
                              <span>
{"Lưu vào yêu thích"}
                              </span>
                            </button>
                            <button className={"remove-btn inline-flex items-center gap-1 font-body-sm text-body-sm text-error hover:opacity-80 transition-opacity"} data-item={"1"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"delete_outline"}
                              </span>
                              <span>
{"Xóa"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                    <article className={"cart-item flex flex-col sm:flex-row gap-space-md sm:gap-space-lg p-space-md rounded-xl bg-surface-container-low/50 hover:bg-surface-container-low transition-all duration-200"} data-unit-price={"28490000"} id={"cart-item-2"}>
                      <div className={"w-full sm:w-36 h-36 rounded-xl bg-surface-container-lowest flex items-center justify-center p-2 shrink-0 relative overflow-hidden shadow-sm"}>
                        <img alt={"Samsung Galaxy S24 Ultra 256GB"} className={"w-full h-full object-contain"} data-alt={"Clean minimal product photography of Samsung Galaxy S24 Ultra in Titanium Gray finish with integrated S-Pen alongside device, pristine studio softbox illumination, subtle geometric shadows, sharp tech aesthetic"} src={"/images/28d9cf506242ffbf.webp"} />
                        <span className={"absolute top-2 left-2 px-1.5 py-0.5 rounded bg-surface text-on-surface font-caption text-caption"}>
{"Samsung"}
                        </span>
                      </div>
                      <div className={"flex-1 flex flex-col justify-between gap-space-sm min-w-0"}>
                        <div className={"flex flex-col gap-1"}>
                          <div className={"flex items-start justify-between gap-2"}>
                            <h2 className={"font-headline-sm text-headline-sm text-on-surface truncate"}>
{"Samsung Galaxy S24 Ultra 256GB"}
                            </h2>
                            <span className={"font-headline-sm text-headline-sm text-on-surface font-semibold shrink-0"} id={"item-total-2"}>
{" 28.490.000₫ "}
                            </span>
                          </div>
                          <div className={"flex flex-wrap items-center gap-2 mt-0.5"}>
                            <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm"}>
                              <span className={"w-2.5 h-2.5 rounded-full bg-[#717376] shrink-0"}>

                              </span>
{" Màu: Titan Xám "}
                            </span>
                            <span className={"px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm"}>
{" Dung lượng: 256GB "}
                            </span>
                          </div>
                          <div className={"flex items-center gap-1.5 text-on-surface-variant font-caption text-caption mt-1"}>
                            <span className={"material-symbols-outlined text-[15px] text-[#16A34A]"} style={{"fontVariationSettings":"'FILL' 1"}}>
{"check_circle"}
                            </span>
                            <span>
{"Bảo hành 12 tháng chính hãng Samsung • Kèm bút S-Pen"}
                            </span>
                          </div>
                        </div>
                        <div className={"flex flex-wrap items-center justify-between gap-space-sm pt-2"}>
                          <div className={"flex items-center rounded-lg bg-surface-container-lowest p-1 shadow-sm"}>
                            <button aria-label={"Giảm số lượng Samsung Galaxy S24 Ultra"} className={"qty-btn-minus w-8 h-8 rounded-md flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"} data-item={"2"} type={"button"}>
                              <span className={"material-symbols-outlined text-[16px]"}>
{"remove"}
                              </span>
                            </button>
                            <span className={"w-10 text-center font-label-md text-label-md font-semibold text-on-surface select-none"} id={"qty-val-2"}>
{"1"}
                            </span>
                            <button aria-label={"Tăng số lượng Samsung Galaxy S24 Ultra"} className={"qty-btn-plus w-8 h-8 rounded-md flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"} data-item={"2"} type={"button"}>
                              <span className={"material-symbols-outlined text-[16px]"}>
{"add"}
                              </span>
                            </button>
                          </div>
                          <div className={"flex items-center gap-space-md"}>
                            <button className={"favorite-btn inline-flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors"} data-active={"false"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"favorite_border"}
                              </span>
                              <span>
{"Lưu vào yêu thích"}
                              </span>
                            </button>
                            <button className={"remove-btn inline-flex items-center gap-1 font-body-sm text-body-sm text-error hover:opacity-80 transition-opacity"} data-item={"2"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"delete_outline"}
                              </span>
                              <span>
{"Xóa"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                    <div className={"hidden flex-col items-center justify-center py-space-2xl text-center"} id={"cart-empty-message"}>
                      <div className={"w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-space-sm text-on-surface-variant"}>
                        <span className={"material-symbols-outlined text-[32px]"}>
{"shopping_bag"}
                        </span>
                      </div>
                      <h3 className={"font-headline-sm text-headline-sm text-on-surface mb-1"}>
{"Giỏ hàng của bạn đang trống"}
                      </h3>
                      <p className={"font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-md"}>
{"Khám phá các dòng flagship mới nhất tích hợp AI độc quyền tại SmartPhone AI."}
                      </p>
                      <a className={"inline-flex items-center gap-2 px-space-lg py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:opacity-95 transition-opacity"} href={"#"}>
{" Khám phá sản phẩm "}
                        <span className={"material-symbols-outlined text-[18px]"}>
{"arrow_forward"}
                        </span>
                      </a>
                    </div>
                  </div>
                  <div className={"flex flex-col gap-space-md"}>
                    <div className={"flex items-center justify-between"}>
                      <a className={"inline-flex items-center gap-2 font-label-md text-label-md text-primary hover:text-primary-container transition-colors group"} href={"#"}>
                        <span className={"material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform"}>
{"arrow_back"}
                        </span>
{" Tiếp tục mua sắm thiết bị khác "}
                      </a>
                      <span className={"font-caption text-caption text-on-surface-variant"}>
{"Đồng kiểm hàng trước khi thanh toán COD"}
                      </span>
                    </div>
                    <div className={"rounded-2xl p-space-lg bg-surface-container-low shadow-sm relative overflow-hidden"}>
                      <div className={"absolute -right-8 -top-8 w-44 h-44 bg-secondary-fixed/50 rounded-full blur-2xl pointer-events-none"}>

                      </div>
                      <div className={"relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md"}>
                        <div className={"flex items-start gap-space-md max-w-xl"}>
                          <div className={"w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0"}>
                            <span className={"material-symbols-outlined text-[22px]"}>
{"auto_awesome"}
                            </span>
                          </div>
                          <div className={"flex flex-col"}>
                            <div className={"flex items-center gap-2 mb-1"}>
                              <h3 className={"font-headline-sm text-headline-sm text-on-surface"}>
{"Cần tư vấn thêm trước khi chốt đơn?"}
                              </h3>
                              <span className={"px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption uppercase tracking-wider font-semibold"}>
{"Trợ lý AI"}
                              </span>
                            </div>
                            <p className={"font-body-sm text-body-sm text-on-surface-variant leading-relaxed"}>
{" Hỏi Trợ lý AI để kiểm tra xem phụ kiện nào tương thích hoặc chính sách giao hàng COD tận nơi có hỗ trợ xem hàng trước không. "}
                            </p>
                          </div>
                        </div>
                        <button className={"whitespace-nowrap inline-flex items-center gap-2 px-space-lg py-3 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md shadow-sm hover:shadow-md hover:bg-secondary-container transition-all self-end md:self-auto shrink-0"} type={"button"}>
                          <span className={"material-symbols-outlined text-[18px]"}>
{"smart_toy"}
                          </span>
{" Hỏi AI ngay ✨ "}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={"lg:col-span-4 sticky top-[96px] flex flex-col gap-space-md"}>
                  <div className={"bg-surface-container-low rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md"}>
                    <div className={"flex items-center justify-between pb-space-xs"}>
                      <h2 className={"font-headline-sm text-headline-sm text-on-surface font-semibold"}>
{"Tóm tắt đơn hàng"}
                      </h2>
                      <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-highest text-on-surface-variant font-caption text-caption"}>
                        <span className={"w-1.5 h-1.5 rounded-full bg-[#16A34A]"}>

                        </span>
{" COD Toàn Quốc "}
                      </span>
                    </div>
                    <div className={"flex flex-col gap-3 text-body-md font-body-md"}>
                      <div className={"flex items-center justify-between text-on-surface-variant"}>
                        <span id={"summary-qty-label"}>
{"Tạm tính (2 sản phẩm)"}
                        </span>
                        <span className={"text-on-surface font-medium"} id={"subtotal-amount"}>
{"63.480.000₫"}
                        </span>
                      </div>
                      <div className={"flex items-center justify-between text-on-surface-variant"}>
                        <div className={"flex items-center gap-1"}>
                          <span>
{"Phí vận chuyển"}
                          </span>
                          <span className={"material-symbols-outlined text-[15px] text-outline"} title={"Giao hàng tận nơi miễn phí toàn quốc"}>
{"info"}
                          </span>
                        </div>
                        <span className={"text-[#16A34A] font-medium"}>
{"Miễn phí (Giao nhanh COD)"}
                        </span>
                      </div>
                      <div className={"flex items-center justify-between text-on-surface-variant"}>
                        <span>
{"Khuyến mãi"}
                        </span>
                        <span className={"text-on-surface-variant"}>
{"-0₫"}
                        </span>
                      </div>
                      <div className={"p-2.5 rounded-lg bg-surface-container font-caption text-caption text-on-surface-variant leading-relaxed flex items-start gap-1.5"}>
                        <span className={"material-symbols-outlined text-[16px] text-outline shrink-0 mt-0.5"}>
{"verified"}
                        </span>
                        <span>
{"Không áp dụng mã giảm giá theo quy định hệ thống chuẩn hóa giá niêm yết trực tiếp."}
                        </span>
                      </div>
                      <div className={"h-px w-full bg-surface-container-highest my-1"}>

                      </div>
                      <div className={"flex items-baseline justify-between pt-1"}>
                        <div className={"flex flex-col"}>
                          <span className={"font-headline-sm text-headline-sm text-on-surface font-bold"}>
{"Tổng thanh toán"}
                          </span>
                          <span className={"font-caption text-caption text-on-surface-variant"}>
{"(Đã bao gồm thuế VAT • Thu tiền mặt khi nhận)"}
                          </span>
                        </div>
                        <span className={"font-headline-md text-headline-md text-primary font-bold tracking-tight"} id={"grand-total-amount"}>
{" 63.480.000₫ "}
                        </span>
                      </div>
                    </div>
                    <button className={"w-full py-4 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold tracking-wide shadow-md hover:bg-primary-container active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"} id={"checkout-btn"} type={"button"}>
                      <span>
{"Tiến hành đặt hàng"}
                      </span>
                      <span className={"material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform"}>
{"arrow_forward"}
                      </span>
                    </button>
                    <div className={"flex flex-col gap-2.5 pt-2"}>
                      <div className={"flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-lowest shadow-sm"}>
                        <div className={"w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-[#16A34A] shrink-0"}>
                          <span className={"material-symbols-outlined text-[18px]"}>
{"local_shipping"}
                          </span>
                        </div>
                        <div className={"flex flex-col"}>
                          <span className={"font-label-sm text-label-sm text-on-surface font-semibold"}>
{"Thanh toán khi nhận hàng (COD)"}
                          </span>
                          <span className={"font-caption text-caption text-on-surface-variant"}>
{"An toàn 100%, không cần chuyển khoản trước"}
                          </span>
                        </div>
                      </div>
                      <div className={"flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-lowest shadow-sm"}>
                        <div className={"w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0"}>
                          <span className={"material-symbols-outlined text-[18px]"}>
{"inventory_2"}
                          </span>
                        </div>
                        <div className={"flex flex-col"}>
                          <span className={"font-label-sm text-label-sm text-on-surface font-semibold"}>
{"Đồng kiểm trước khi trả tiền"}
                          </span>
                          <span className={"font-caption text-caption text-on-surface-variant"}>
{"Mở hộp kiểm tra ngoại quan máy cùng nhân viên giao"}
                          </span>
                        </div>
                      </div>
                      <div className={"flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-lowest shadow-sm"}>
                        <div className={"w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary shrink-0"}>
                          <span className={"material-symbols-outlined text-[18px]"}>
{"verified"}
                          </span>
                        </div>
                        <div className={"flex flex-col"}>
                          <span className={"font-label-sm text-label-sm text-on-surface font-semibold"}>
{"Máy mới 100% nguyên seal"}
                          </span>
                          <span className={"font-caption text-caption text-on-surface-variant"}>
{"Bảo hành 12 tháng chính hãng toàn quốc"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={"p-3 text-center text-on-surface-variant font-caption text-caption"}>
{" Hotline hỗ trợ đặt đơn tức thì: "}
                    <a className={"font-semibold text-primary hover:underline"} href={"tel:18008899"}>
{"1800-8899"}
                    </a>
{" (Miễn phí) "}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className={"w-full bg-surface-container-low border-t border-surface-variant mt-auto"}>
        <div className={"max-w-[1280px] mx-auto px-gutter pt-space-2xl pb-space-xl"}>
          <div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-xl pb-space-xl border-b border-surface-variant"}>
            <div className={"flex flex-col gap-space-md"}>
              <div className={"flex items-center gap-space-sm"}>
                <span className={"font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold"}>
{"SmartPhone "}
                  <span className={"text-secondary"}>
{"AI"}
                  </span>
                </span>
              </div>
              <p className={"font-body-sm text-body-sm text-on-surface-variant leading-relaxed"}>
{"Hệ thống bán lẻ điện thoại thông minh tích hợp trí tuệ nhân tạo hàng đầu Việt Nam. Mua sắm thông minh, lựa chọn chính xác."}
              </p>
              <div className={"flex items-center gap-2 pt-space-xs"}>
                <span className={"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest border border-surface-variant font-label-sm text-label-sm text-on-surface-variant"}>
                  <span className={"material-symbols-outlined text-[16px] text-[#16A34A]"}>
{"verified"}
                  </span>
{"Đại lý ủy quyền chính hãng"}
                </span>
              </div>
            </div>
            <div className={"flex flex-col gap-space-sm"}>
              <h3 className={"font-label-md text-label-md text-on-surface font-semibold tracking-wide"}>
{"Khám phá"}
              </h3>
              <ul className={"flex flex-col gap-2 mt-1"}>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"}>
{"iPhone (Apple)"}
                </li>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"}>
{"Samsung Galaxy"}
                </li>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"}>
{"Xiaomi"}
                </li>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"}>
{"OPPO"}
                </li>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"}>
{"vivo"}
                </li>
                <li className={"font-body-sm text-body-sm text-secondary font-medium hover:underline transition-all cursor-pointer flex items-center gap-1"}>
{"Điện thoại AI Thế hệ mới "}
                  <span className={"material-symbols-outlined text-[14px]"}>
{"north_east"}
                  </span>
                </li>
              </ul>
            </div>
            <div className={"flex flex-col gap-space-sm"}>
              <h3 className={"font-label-md text-label-md text-on-surface font-semibold tracking-wide"}>
{"Hỗ trợ & Chính sách"}
              </h3>
              <ul className={"flex flex-col gap-2 mt-1"}>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"}>
{"Chính sách bảo hành 12 tháng"}
                </li>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"}>
{"Đổi trả trong 7 ngày"}
                </li>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer flex items-center gap-1"}>
{"Kiểm tra đơn hàng COD"}
                </li>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"}>
{"Hướng dẫn mua hàng trả góp 0%"}
                </li>
              </ul>
            </div>
            <div className={"flex flex-col gap-space-sm"}>
              <h3 className={"font-label-md text-label-md text-secondary font-semibold tracking-wide flex items-center gap-1.5"}>
                <span className={"material-symbols-outlined text-[18px]"}>
{"smart_toy"}
                </span>
{"Trợ lý AI"}
              </h3>
              <ul className={"flex flex-col gap-2 mt-1"}>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"}>
{"Tư vấn cấu hình theo nhu cầu"}
                </li>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"}>
{"So sánh điện thoại thông minh"}
                </li>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"}>
{"Giải đáp chính sách RAG"}
                </li>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"}>
{"Trò chuyện công nghệ 24/7"}
                </li>
              </ul>
            </div>
          </div>
          <div className={"pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md font-caption text-caption text-on-surface-variant"}>
            <div className={"flex flex-wrap items-center gap-space-md"}>
              <span className={"flex items-center gap-1 font-medium text-on-surface"}>
                <span className={"material-symbols-outlined text-[16px] text-primary"}>
{"call"}
                </span>
{"Hotline: 1800-8899 (Miễn phí)"}
              </span>
              <span className={"text-outline-variant"}>
{"|"}
              </span>
              <span className={"inline-flex items-center gap-1 text-[#16A34A] font-medium"}>
                <span className={"material-symbols-outlined text-[15px]"}>
{"local_shipping"}
                </span>
{"Thanh toán COD an toàn khi nhận hàng"}
              </span>
            </div>
            <div>
{"© 2025 SmartPhone AI Retail. Thiết kế tối giản chuẩn công nghệ cao cấp."}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
