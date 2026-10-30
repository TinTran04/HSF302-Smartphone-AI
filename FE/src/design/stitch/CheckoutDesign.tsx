// Converted from t_h_ng_cod_smartphone_ai/code.html. Read-only design reference.
// Inline scripts were replaced by React state in src/pages and src/features.
export default function CheckoutDesign() {
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
          <div className={"w-full bg-surface-container-low border-b border-surface-variant"}>
            <div className={"max-w-[1280px] mx-auto px-gutter py-space-xs flex items-center justify-between text-on-surface-variant"}>
              <div className={"flex items-center gap-space-sm font-label-sm text-label-sm"}>
                <span className={"inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#16A34A]/10 text-[#16A34A]"}>
                  <span className={"material-symbols-outlined text-[14px]"}>
{"verified_user"}
                  </span>
                </span>
                <span>
{"Cam kết bảo mật giao dịch • Kiểm tra hàng trước khi thanh toán COD"}
                </span>
              </div>
              <div className={"hidden sm:flex items-center gap-space-md font-label-sm text-label-sm"}>
                <span className={"flex items-center gap-1 text-on-surface"}>
                  <span className={"material-symbols-outlined text-[15px] text-primary"}>
{"local_shipping"}
                  </span>
{" Giao hỏa tốc 2-4h nội thành "}
                </span>
                <span className={"text-outline-variant"}>
{"|"}
                </span>
                <button className={"text-secondary hover:text-primary font-medium underline transition-colors cursor-pointer flex items-center gap-1"} id={"demoSuccessTrigger"} type={"button"}>
                  <span className={"material-symbols-outlined text-[14px]"}>
{"visibility"}
                  </span>
{" Xem trước thông báo hoàn tất "}
                </button>
              </div>
            </div>
          </div>
          <div className={"max-w-[1280px] w-full mx-auto px-gutter py-space-xl"}>
            <div className={"flex flex-col md:flex-row md:items-center justify-between gap-space-lg mb-space-2xl"}>
              <nav aria-label={"Breadcrumb"} className={"flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant"}>
                <a className={"hover:text-on-surface transition-colors"} href={"#"}>
{"Trang chủ"}
                </a>
                <span className={"material-symbols-outlined text-[16px] text-outline"}>
{"chevron_right"}
                </span>
                <a className={"hover:text-on-surface transition-colors"} href={"#"}>
{"Giỏ hàng"}
                </a>
                <span className={"material-symbols-outlined text-[16px] text-outline"}>
{"chevron_right"}
                </span>
                <span className={"text-on-surface font-semibold"}>
{"Đặt hàng"}
                </span>
              </nav>
              <div className={"flex items-center gap-space-md sm:gap-space-lg"}>
                <div className={"flex items-center gap-space-xs text-on-surface"}>
                  <span className={"w-6 h-6 rounded-full bg-[#16A34A] text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold shadow-sm"}>
                    <span className={"material-symbols-outlined text-[16px]"}>
{"check"}
                    </span>
                  </span>
                  <span className={"font-label-md text-label-md font-medium text-on-surface"}>
{"Giỏ hàng"}
                  </span>
                </div>
                <div className={"w-8 h-[2px] bg-[#16A34A]"}>

                </div>
                <div className={"flex items-center gap-space-xs"}>
                  <span className={"w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold shadow-sm ring-4 ring-primary-fixed"}>
{" 2 "}
                  </span>
                  <span className={"font-label-md text-label-md font-semibold text-primary"}>
{"Thông tin & COD"}
                  </span>
                </div>
                <div className={"w-8 h-[2px] bg-surface-variant"}>

                </div>
                <div className={"flex items-center gap-space-xs text-outline"}>
                  <span className={"w-6 h-6 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-label-sm text-label-sm font-medium"}>
{" 3 "}
                  </span>
                  <span className={"font-label-md text-label-md text-on-surface-variant"}>
{"Hoàn tất"}
                  </span>
                </div>
              </div>
            </div>
            <div className={"grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start"}>
              <div className={"lg:col-span-7 flex flex-col gap-space-xl"}>
                <div className={"bg-surface-container-lowest rounded-2xl p-space-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-surface-variant/80"}>
                  <div className={"flex items-center justify-between pb-space-lg mb-space-lg border-b border-surface-variant"}>
                    <div className={"flex items-center gap-space-sm"}>
                      <span className={"w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center"}>
                        <span className={"material-symbols-outlined text-[18px]"}>
{"pin_drop"}
                        </span>
                      </span>
                      <div>
                        <h2 className={"font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight"}>
{"1. Thông tin nhận hàng"}
                        </h2>
                        <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"Vui lòng kiểm tra kỹ địa chỉ để nhận máy nhanh nhất"}
                        </p>
                      </div>
                    </div>
                    <span className={"px-2.5 py-1 rounded-full bg-surface-container font-caption text-caption text-on-surface-variant font-medium"}>
{" Đồng bộ tài khoản AI "}
                    </span>
                  </div>
                  <form className={"grid grid-cols-1 md:grid-cols-2 gap-space-md"} id={"checkoutForm"}>
                    <div className={"flex flex-col gap-1.5 md:col-span-1"}>
                      <label className={"font-label-sm text-label-sm text-on-surface font-medium flex items-center justify-between"} htmlFor={"fullName"}>
                        <span>
{"Họ và tên người nhận"}
                        </span>
                        <span className={"text-error"}>
{"*"}
                        </span>
                      </label>
                      <div className={"relative"}>
                        <input className={"w-full h-11 px-3.5 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all"} id={"fullName"} required={true} type={"text"} defaultValue={"Nguyễn Minh Hoàng"} />
                        <span className={"material-symbols-outlined absolute right-3 top-3 text-[18px] text-[#16A34A]"}>
{"check_circle"}
                        </span>
                      </div>
                    </div>
                    <div className={"flex flex-col gap-1.5 md:col-span-1"}>
                      <label className={"font-label-sm text-label-sm text-on-surface font-medium flex items-center justify-between"} htmlFor={"phoneNumber"}>
                        <span>
{"Số điện thoại"}
                        </span>
                        <span className={"text-error"}>
{"*"}
                        </span>
                      </label>
                      <div className={"relative"}>
                        <input className={"w-full h-11 px-3.5 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all"} id={"phoneNumber"} required={true} type={"tel"} defaultValue={"0912 345 678"} />
                        <span className={"material-symbols-outlined absolute right-3 top-3 text-[18px] text-[#16A34A]"}>
{"check_circle"}
                        </span>
                      </div>
                    </div>
                    <div className={"flex flex-col gap-1.5 md:col-span-1"}>
                      <label className={"font-label-sm text-label-sm text-on-surface font-medium"} htmlFor={"city"}>
{" Tỉnh / Thành phố "}
                        <span className={"text-error"}>
{"*"}
                        </span>
                      </label>
                      <div className={"relative"}>
                        <select className={"w-full h-11 px-3.5 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all appearance-none pr-10 cursor-pointer"} id={"city"} defaultValue={"HN"}>
                          <option value={"HN"}>
{"Hà Nội"}
                          </option>
                          <option value={"HCM"}>
{"TP. Hồ Chí Minh"}
                          </option>
                          <option value={"DN"}>
{"Đà Nẵng"}
                          </option>
                          <option value={"HP"}>
{"Hải Phòng"}
                          </option>
                          <option value={"CT"}>
{"Cần Thơ"}
                          </option>
                        </select>
                        <span className={"material-symbols-outlined absolute right-3 top-3 text-[20px] text-outline pointer-events-none"}>
{"expand_more"}
                        </span>
                      </div>
                    </div>
                    <div className={"flex flex-col gap-1.5 md:col-span-1"}>
                      <label className={"font-label-sm text-label-sm text-on-surface font-medium"} htmlFor={"district"}>
{" Quận / Huyện "}
                        <span className={"text-error"}>
{"*"}
                        </span>
                      </label>
                      <div className={"relative"}>
                        <select className={"w-full h-11 px-3.5 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all appearance-none pr-10 cursor-pointer"} id={"district"} defaultValue={"CG"}>
                          <option value={"CG"}>
{"Quận Cầu Giấy"}
                          </option>
                          <option value={"BD"}>
{"Quận Ba Đình"}
                          </option>
                          <option value={"TX"}>
{"Quận Thanh Xuân"}
                          </option>
                          <option value={"HK"}>
{"Quận Hoàn Kiếm"}
                          </option>
                          <option value={"HBT"}>
{"Quận Hai Bà Trưng"}
                          </option>
                        </select>
                        <span className={"material-symbols-outlined absolute right-3 top-3 text-[20px] text-outline pointer-events-none"}>
{"expand_more"}
                        </span>
                      </div>
                    </div>
                    <div className={"flex flex-col gap-1.5 md:col-span-2"}>
                      <label className={"font-label-sm text-label-sm text-on-surface font-medium"} htmlFor={"ward"}>
{" Phường / Xã "}
                        <span className={"text-error"}>
{"*"}
                        </span>
                      </label>
                      <div className={"relative"}>
                        <select className={"w-full h-11 px-3.5 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all appearance-none pr-10 cursor-pointer"} id={"ward"} defaultValue={"DVH"}>
                          <option value={"DVH"}>
{"Phường Dịch Vọng Hậu"}
                          </option>
                          <option value={"DV"}>
{"Phường Dịch Vọng"}
                          </option>
                          <option value={"MY"}>
{"Phường Mai Dịch"}
                          </option>
                          <option value={"NT"}>
{"Phường Nghĩa Tân"}
                          </option>
                        </select>
                        <span className={"material-symbols-outlined absolute right-3 top-3 text-[20px] text-outline pointer-events-none"}>
{"expand_more"}
                        </span>
                      </div>
                    </div>
                    <div className={"flex flex-col gap-1.5 md:col-span-2"}>
                      <label className={"font-label-sm text-label-sm text-on-surface font-medium"} htmlFor={"address"}>
{" Địa chỉ chi tiết (Số nhà, tên ngõ, tòa nhà) "}
                        <span className={"text-error"}>
{"*"}
                        </span>
                      </label>
                      <input className={"w-full h-11 px-3.5 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all"} id={"address"} required={true} type={"text"} defaultValue={"Số 18, Ngõ 86 Duy Tân"} />
                    </div>
                    <div className={"flex flex-col gap-1.5 md:col-span-2"}>
                      <label className={"font-label-sm text-label-sm text-on-surface font-medium flex items-center justify-between"} htmlFor={"notes"}>
                        <span>
{"Ghi chú đơn hàng (Không bắt buộc)"}
                        </span>
                        <span className={"text-on-surface-variant font-caption text-caption"}>
{"Tối đa 200 ký tự"}
                        </span>
                      </label>
                      <textarea className={"w-full p-3 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all resize-none"} id={"notes"} placeholder={"Ví dụ: Giao giờ hành chính, gọi trước khi đến 15 phút..."} rows={2} defaultValue={"Giao giờ hành chính, gọi trước khi đến 15 phút"} />
                    </div>
                  </form>
                </div>
                <div className={"bg-surface-container-lowest rounded-2xl p-space-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-surface-variant/80"}>
                  <div className={"flex items-center justify-between pb-space-lg mb-space-lg border-b border-surface-variant"}>
                    <div className={"flex items-center gap-space-sm"}>
                      <span className={"w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center"}>
                        <span className={"material-symbols-outlined text-[18px]"}>
{"payments"}
                        </span>
                      </span>
                      <div>
                        <h2 className={"font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight"}>
{"2. Phương thức thanh toán"}
                        </h2>
                        <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"Chính sách thanh toán độc quyền tại SmartPhone AI"}
                        </p>
                      </div>
                    </div>
                    <span className={"inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#16A34A]/10 text-[#16A34A] font-label-sm text-label-sm font-semibold"}>
                      <span className={"material-symbols-outlined text-[14px]"}>
{"shield"}
                      </span>
{" 100% An toàn "}
                    </span>
                  </div>
                  <div className={"relative bg-surface-container-lowest rounded-xl p-space-lg border-2 border-primary shadow-sm transition-all"}>
                    <div className={"flex items-start gap-space-md"}>
                      <div className={"pt-0.5"}>
                        <div className={"w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center bg-surface-container-lowest"}>
                          <div className={"w-2.5 h-2.5 rounded-full bg-primary"}>

                          </div>
                        </div>
                      </div>
                      <div className={"flex-1"}>
                        <div className={"flex flex-wrap items-center justify-between gap-space-xs mb-1.5"}>
                          <span className={"font-headline-sm text-headline-sm text-on-surface font-semibold"}>
{" Thanh toán khi nhận hàng (COD) "}
                          </span>
                          <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A] font-caption text-caption font-bold tracking-wide uppercase"}>
                            <span className={"material-symbols-outlined text-[13px]"}>
{"done"}
                            </span>
{" Miễn phí thu hộ COD "}
                          </span>
                        </div>
                        <p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-md"}>
{" Khách hàng được quyền mở hộp đồng kiểm máy, phụ kiện và hóa đơn bảo hành chính hãng trước khi thanh toán tiền mặt cho nhân viên giao hàng. "}
                        </p>
                        <div className={"grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-xs border-t border-surface-variant text-on-surface"}>
                          <div className={"flex items-center gap-2 font-body-sm text-body-sm"}>
                            <span className={"material-symbols-outlined text-[16px] text-[#16A34A]"}>
{"check_box"}
                            </span>
                            <span>
{"Kiểm tra seal hộp nguyên vẹn"}
                            </span>
                          </div>
                          <div className={"flex items-center gap-2 font-body-sm text-body-sm"}>
                            <span className={"material-symbols-outlined text-[16px] text-[#16A34A]"}>
{"check_box"}
                            </span>
                            <span>
{"Check IMEI / Serial bảo hành"}
                            </span>
                          </div>
                          <div className={"flex items-center gap-2 font-body-sm text-body-sm"}>
                            <span className={"material-symbols-outlined text-[16px] text-[#16A34A]"}>
{"check_box"}
                            </span>
                            <span>
{"Nhận biên lai đỏ kiêm bảo hành"}
                            </span>
                          </div>
                          <div className={"flex items-center gap-2 font-body-sm text-body-sm"}>
                            <span className={"material-symbols-outlined text-[16px] text-[#16A34A]"}>
{"check_box"}
                            </span>
                            <span>
{"Hài lòng mới trả tiền mặt"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={"mt-space-lg p-space-md rounded-xl bg-surface-container flex items-start gap-space-md"}>
                    <span className={"material-symbols-outlined text-secondary text-[22px] mt-0.5 shrink-0"}>
{"info"}
                    </span>
                    <div className={"flex-1"}>
                      <p className={"font-label-md text-label-md text-on-surface font-semibold mb-0.5"}>
{"Cam kết minh bạch tài chính"}
                      </p>
                      <p className={"font-body-sm text-body-sm text-on-surface-variant leading-relaxed"}>
{" Hệ thống SmartPhone AI áp dụng thanh toán COD an toàn tuyệt đối, không yêu cầu đặt cọc hay thanh toán trước qua bất kỳ hình thức nào. Nhân viên giao hàng không được phép thu thêm bất kỳ phụ phí nào ngoài hóa đơn. "}
                      </p>
                    </div>
                  </div>
                  <div className={"mt-space-lg pt-space-md border-t border-surface-variant flex flex-wrap items-center justify-around gap-space-md text-on-surface-variant"}>
                    <div className={"flex items-center gap-1.5 font-label-sm text-label-sm"}>
                      <span className={"material-symbols-outlined text-[18px] text-primary"}>
{"verified"}
                      </span>
                      <span>
{"100% Chính Hãng Apple & Samsung"}
                      </span>
                    </div>
                    <div className={"flex items-center gap-1.5 font-label-sm text-label-sm"}>
                      <span className={"material-symbols-outlined text-[18px] text-[#16A34A]"}>
{"sync"}
                      </span>
                      <span>
{"Đổi mới 30 ngày nếu lỗi NSX"}
                      </span>
                    </div>
                    <div className={"flex items-center gap-1.5 font-label-sm text-label-sm"}>
                      <span className={"material-symbols-outlined text-[18px] text-secondary"}>
{"support_agent"}
                      </span>
                      <span>
{"Hỗ trợ kích hoạt tận nhà"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={"lg:col-span-5 flex flex-col gap-space-lg lg:sticky lg:top-[92px]"}>
                <div className={"bg-surface-container-lowest rounded-2xl p-space-xl shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-surface-variant"}>
                  <div className={"flex items-center justify-between pb-space-md mb-space-md border-b border-surface-variant"}>
                    <h3 className={"font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight"}>
{"Tóm tắt đơn hàng (2)"}
                    </h3>
                    <a className={"font-label-sm text-label-sm text-primary hover:underline font-medium"} href={"#"}>
{"Chỉnh sửa"}
                    </a>
                  </div>
                  <div className={"flex flex-col gap-space-md pb-space-lg border-b border-surface-variant"}>
                    <div className={"flex items-start gap-space-md group"}>
                      <div className={"w-16 h-16 rounded-xl bg-surface-container-low border border-surface-variant/60 flex items-center justify-center p-1.5 shrink-0 overflow-hidden"}>
                        <img className={"w-full h-full object-contain"} data-alt={"High-end smartphone iPhone 16 Pro Max Natural Titanium studio shot clean white background luxury minimalist product photography"} src={"/images/05d4f5f8bdd393f5.webp"} alt={"High-end smartphone iPhone 16 Pro Max Natural Titanium studio shot clean white background luxury minimalist product photography"} />
                      </div>
                      <div className={"flex-1 min-w-0"}>
                        <div className={"flex items-start justify-between gap-2"}>
                          <h4 className={"font-label-md text-label-md text-on-surface font-semibold truncate group-hover:text-primary transition-colors"}>
{" iPhone 16 Pro Max "}
                          </h4>
                          <span className={"font-label-md text-label-md text-on-surface font-bold whitespace-nowrap"}>
{" 34.990.000₫ "}
                          </span>
                        </div>
                        <div className={"flex items-center gap-2 mt-1"}>
                          <span className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"Titan Tự Nhiên • 256GB"}
                          </span>
                          <span className={"text-outline-variant"}>
{"•"}
                          </span>
                          <span className={"font-body-sm text-body-sm text-on-surface-variant font-medium"}>
{"SL: 1"}
                          </span>
                        </div>
                        <div className={"inline-flex items-center gap-1 mt-1 font-caption text-caption text-[#16A34A] bg-[#16A34A]/5 px-2 py-0.5 rounded-full"}>
                          <span className={"material-symbols-outlined text-[13px]"}>
{"done_all"}
                          </span>
                          <span>
{"Có sẵn hàng giao ngay"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={"flex items-start gap-space-md group"}>
                      <div className={"w-16 h-16 rounded-xl bg-surface-container-low border border-surface-variant/60 flex items-center justify-center p-1.5 shrink-0 overflow-hidden"}>
                        <img className={"w-full h-full object-contain"} data-alt={"Samsung Galaxy S24 Ultra Titanium Gray smartphone clean angled studio presentation professional lighting"} src={"/images/f5e4d2f2d5e61c59.webp"} alt={"Samsung Galaxy S24 Ultra Titanium Gray smartphone clean angled studio presentation professional lighting"} />
                      </div>
                      <div className={"flex-1 min-w-0"}>
                        <div className={"flex items-start justify-between gap-2"}>
                          <h4 className={"font-label-md text-label-md text-on-surface font-semibold truncate group-hover:text-primary transition-colors"}>
{" Galaxy S24 Ultra AI "}
                          </h4>
                          <span className={"font-label-md text-label-md text-on-surface font-bold whitespace-nowrap"}>
{" 28.490.000₫ "}
                          </span>
                        </div>
                        <div className={"flex items-center gap-2 mt-1"}>
                          <span className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"Titan Xám • 256GB"}
                          </span>
                          <span className={"text-outline-variant"}>
{"•"}
                          </span>
                          <span className={"font-body-sm text-body-sm text-on-surface-variant font-medium"}>
{"SL: 1"}
                          </span>
                        </div>
                        <div className={"inline-flex items-center gap-1 mt-1 font-caption text-caption text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded-full"}>
                          <span className={"material-symbols-outlined text-[13px]"}>
{"auto_awesome"}
                          </span>
                          <span>
{"Bộ quà AI Care + Ốp lưng"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={"py-space-md flex flex-col gap-space-sm border-b border-surface-variant"}>
                    <div className={"flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant"}>
                      <span>
{"Tạm tính (2 sản phẩm)"}
                      </span>
                      <span className={"font-medium text-on-surface"}>
{"63.480.000₫"}
                      </span>
                    </div>
                    <div className={"flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant"}>
                      <span className={"flex items-center gap-1"}>
{" Phí vận chuyển COD "}
                        <span className={"material-symbols-outlined text-[14px] text-outline cursor-help"} title={"Miễn phí giao hàng COD toàn quốc cho đơn từ 2.000.000₫"}>
{"help"}
                        </span>
                      </span>
                      <span className={"text-[#16A34A] font-semibold"}>
{"0₫ (Miễn phí)"}
                      </span>
                    </div>
                    <div className={"flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant"}>
                      <span>
{"Phí dịch vụ thu hộ COD"}
                      </span>
                      <span className={"text-[#16A34A] font-semibold"}>
{"0₫"}
                      </span>
                    </div>
                  </div>
                  <div className={"pt-space-lg mb-space-lg flex flex-col gap-1"}>
                    <div className={"flex items-baseline justify-between"}>
                      <span className={"font-label-md text-label-md text-on-surface font-semibold"}>
{"Tổng thanh toán:"}
                      </span>
                      <div className={"text-right"}>
                        <span className={"font-headline-md text-headline-md font-bold text-primary tracking-tight"}>
{" 63.480.000₫ "}
                        </span>
                        <p className={"font-caption text-caption text-on-surface-variant"}>
{"Đã bao gồm 10% thuế VAT • Trả tiền mặt khi nhận hàng"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button className={"w-full h-14 bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-headline-sm font-semibold rounded-xl flex items-center justify-center gap-space-sm shadow-[0_8px_20px_rgba(0,102,204,0.25)] hover:shadow-[0_12px_28px_rgba(0,102,204,0.35)] transition-all cursor-pointer group"} id={"btnConfirmOrder"} type={"button"}>
                    <span>
{"Xác nhận đặt hàng COD"}
                    </span>
                    <span className={"material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform"}>
{"arrow_forward"}
                    </span>
                  </button>
                  <div className={"mt-space-md text-center"}>
                    <p className={"font-caption text-caption text-on-surface-variant leading-relaxed"}>
{" Bằng việc nhấn xác nhận, bạn đồng ý với "}
                      <a className={"text-primary underline"} href={"#"}>
{"Điều khoản dịch vụ"}
                      </a>
{" và "}
                      <a className={"text-primary underline"} href={"#"}>
{"Chính sách đồng kiểm COD"}
                      </a>
{" của SmartPhone AI. "}
                    </p>
                  </div>
                </div>
                <div className={"bg-surface-container rounded-2xl p-space-md border border-secondary-fixed flex items-center gap-space-md"}>
                  <div className={"w-10 h-10 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shrink-0"}>
                    <span className={"material-symbols-outlined text-[22px]"}>
{"smart_toy"}
                    </span>
                  </div>
                  <div className={"min-w-0"}>
                    <p className={"font-label-md text-label-md text-on-surface font-semibold"}>
{"Trợ lý AI SmartPhone"}
                    </p>
                    <p className={"font-body-sm text-body-sm text-on-surface-variant truncate"}>
{"Sẵn sàng hỗ trợ kiểm tra tình trạng hàng & tư vấn phụ kiện"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={"fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-md hidden flex items-center justify-center p-gutter transition-all duration-300"} id={"successModalOverlay"}>
            <div className={"relative w-full max-w-[580px] bg-surface-container-lowest rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-surface-variant overflow-hidden animate-in fade-in zoom-in-95 duration-200"}>
              <div className={"h-2 w-full bg-gradient-to-r from-primary via-secondary to-[#16A34A]"}>

              </div>
              <div className={"p-space-xl sm:p-space-2xl flex flex-col items-center text-center"}>
                <button aria-label={"Đóng cửa sổ"} className={"absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"} id={"closeModalBtn"} type={"button"}>
                  <span className={"material-symbols-outlined text-[18px]"}>
{"close"}
                  </span>
                </button>
                <div className={"w-20 h-20 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center mb-space-lg shadow-inner ring-8 ring-[#16A34A]/5"}>
                  <span className={"material-symbols-outlined text-[44px]"}>
{"task_alt"}
                  </span>
                </div>
                <div className={"inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-fixed text-primary font-label-md text-label-md font-bold mb-space-sm"}>
                  <span className={"material-symbols-outlined text-[16px]"}>
{"receipt_long"}
                  </span>
                  <span>
{"MÃ ĐƠN: #SMAI-89240"}
                  </span>
                </div>
                <h3 className={"font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight mb-space-xs"}>
{" Đặt hàng thành công! "}
                </h3>
                <p className={"font-body-md text-body-md text-on-surface-variant max-w-md mb-space-lg leading-relaxed"}>
{" Cảm ơn bạn "}
                  <strong className={"text-on-surface font-semibold"}>
{"Nguyễn Minh Hoàng"}
                  </strong>
{"! Đơn hàng COD của bạn đã được ghi nhận vào hệ thống. Tư vấn viên AI & đội ngũ SmartPhone AI sẽ liên hệ xác nhận trong "}
                  <span className={"text-primary font-semibold"}>
{"15 phút"}
                  </span>
{". "}
                </p>
                <div className={"w-full bg-surface-container-low rounded-2xl p-space-lg text-left mb-space-xl border border-surface-variant/80"}>
                  <div className={"flex items-center justify-between pb-space-sm mb-space-sm border-b border-surface-variant"}>
                    <span className={"font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold"}>
{"Hình thức thanh toán"}
                    </span>
                    <span className={"font-label-md text-label-md text-[#16A34A] font-bold flex items-center gap-1"}>
                      <span className={"material-symbols-outlined text-[16px]"}>
{"payments"}
                      </span>
{" Tiền mặt khi nhận hàng (COD) "}
                    </span>
                  </div>
                  <div className={"space-y-2"}>
                    <div className={"flex justify-between font-body-sm text-body-sm"}>
                      <span className={"text-on-surface-variant"}>
{"Tổng tiền cần thanh toán:"}
                      </span>
                      <span className={"font-headline-sm text-headline-sm text-primary font-bold"}>
{"63.480.000₫"}
                      </span>
                    </div>
                    <div className={"flex justify-between font-body-sm text-body-sm"}>
                      <span className={"text-on-surface-variant"}>
{"Địa chỉ nhận hàng:"}
                      </span>
                      <span className={"font-medium text-on-surface text-right"}>
{"Số 18, Ngõ 86 Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội"}
                      </span>
                    </div>
                    <div className={"flex justify-between font-body-sm text-body-sm"}>
                      <span className={"text-on-surface-variant"}>
{"Thời gian dự kiến nhận:"}
                      </span>
                      <span className={"font-medium text-[#16A34A] text-right"}>
{"Hôm nay (Trong 2 - 4 giờ)"}
                      </span>
                    </div>
                  </div>
                  <div className={"mt-space-md pt-space-sm border-t border-surface-variant/70 flex items-center gap-2 font-caption text-caption text-on-surface-variant"}>
                    <span className={"material-symbols-outlined text-[15px] text-[#16A34A]"}>
{"inventory"}
                    </span>
                    <span>
{"Quyền lợi: Bạn được khui hộp kiểm tra màn hình, phụ kiện trước khi trả tiền."}
                    </span>
                  </div>
                </div>
                <div className={"w-full grid grid-cols-1 sm:grid-cols-2 gap-space-md"}>
                  <a className={"w-full h-12 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"} href={"#"}>
                    <span className={"material-symbols-outlined text-[18px]"}>
{"receipt"}
                    </span>
                    <span>
{"Xem đơn hàng của tôi"}
                    </span>
                  </a>
                  <button className={"w-full h-12 bg-surface-container hover:bg-surface-variant text-on-surface rounded-xl font-label-md text-label-md font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"} id={"btnContinueShopping"} type={"button"}>
                    <span className={"material-symbols-outlined text-[18px]"}>
{"shopping_bag"}
                    </span>
                    <span>
{"Tiếp tục mua sắm"}
                    </span>
                  </button>
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
