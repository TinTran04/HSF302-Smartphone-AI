// Converted from t_ng_quan_smartphone_ai_admin/code.html. Read-only design reference.
// Inline scripts were replaced by React state in src/pages and src/features.
export default function DashboardDesign() {
  return (
    <div className="bg-background font-body-md text-body-md text-on-surface antialiased">
      <aside className={"fixed left-0 top-0 h-full w-[260px] bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between pt-6 pb-6"}>
        <div className={"flex flex-col"}>
          <div className={"px-6 mb-8 flex items-center justify-between"}>
            <div className={"flex items-center gap-2.5"}>
              <div className={"w-9 h-9 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary"}>
                <span className={"material-symbols-outlined text-[20px]"}>
{"auto_awesome"}
                </span>
              </div>
              <div className={"flex flex-col"}>
                <span className={"font-headline-sm text-label-md text-on-surface font-semibold tracking-tight"}>
{"SmartPhone AI"}
                </span>
                <span className={"font-caption text-caption text-secondary font-medium tracking-wide"}>
{"ADMIN PORTAL"}
                </span>
              </div>
            </div>
          </div>
          <nav className={"px-3 flex flex-col gap-1"}>
            <a aria-current={"page"} className={"flex items-center gap-3 px-3.5 py-2.5 transition-all bg-primary text-on-primary font-medium rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)]"} data-path={"tong-quan"} href={"#"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"dashboard"}
              </span>
              <span>
{"Tổng quan"}
              </span>
            </a>
            <a className={"flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"} data-path={"quan-ly-san-pham"} href={"#"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"smartphone"}
              </span>
              <span>
{"Quản lý sản phẩm"}
              </span>
            </a>
            <a className={"flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"} data-path={"quan-ly-don-hang"} href={"#"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"receipt_long"}
              </span>
              <span>
{"Quản lý đơn hàng"}
              </span>
            </a>
            <a className={"flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"} data-path={"kho-kien-thuc-ai"} href={"#"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"dataset"}
              </span>
              <span>
{"Kho kiến thức AI"}
              </span>
            </a>
            <a className={"flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"} data-path={"cau-hinh-ai"} href={"#"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"tune"}
              </span>
              <span>
{"Cấu hình AI"}
              </span>
            </a>
          </nav>
        </div>
        <div className={"px-3 flex flex-col gap-3"}>
          <a className={"flex items-center justify-between px-3.5 py-2.5 rounded-lg font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"} href={"/"}>
{"Quay lại cửa hàng"}
          </a>
          <div className={"p-3 bg-surface-container-low rounded-xl flex items-center gap-3"}>
            <div className={"w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0"}>
              <span className={"material-symbols-outlined text-on-primary text-[18px]"}>
{"person"}
              </span>
            </div>
            <div className={"flex flex-col min-w-0 flex-1"}>
              <span className={"font-label-sm text-label-sm text-on-surface font-medium truncate"}>
{"Quản trị viên"}
              </span>
              <span className={"font-caption text-caption text-on-surface-variant truncate"}>
{"Super Admin"}
              </span>
            </div>
          </div>
        </div>
      </aside>
      <div className={"pl-[260px]"}>
        <header className={"fixed top-0 left-[260px] right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-8 flex items-center justify-between"}>
          <div className={"flex items-center gap-2"}>
            <span className={"font-label-sm text-label-sm text-on-surface-variant"}>
{"SmartPhone AI"}
            </span>
            <span className={"font-caption text-caption text-outline"}>
{"/"}
            </span>
            <span className={"font-label-sm text-label-sm text-on-surface font-medium"}>
{"Bảng điều khiển"}
            </span>
          </div>
          <div className={"flex items-center gap-5"}>
            <div className={"hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low"}>
              <span className={"w-2 h-2 rounded-full bg-primary-container animate-pulse"}>

              </span>
              <span className={"font-label-sm text-label-sm text-on-surface-variant"}>
{"Hệ thống AI: Hoạt động"}
              </span>
            </div>
            <div className={"hidden md:flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant"}>
              <span className={"material-symbols-outlined text-[16px]"}>
{"schedule"}
              </span>
              <span>
{"Hôm nay"}
              </span>
            </div>
            <button className={"w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"} type={"button"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"notifications"}
              </span>
            </button>
            <div className={"w-8 h-8 rounded-full bg-primary flex items-center justify-center"}>
              <span className={"material-symbols-outlined text-on-primary text-[18px]"}>
{"person"}
              </span>
            </div>
          </div>
        </header>
        <main className={"w-full pt-16 bg-background min-h-screen"}>
          <div className={"flex flex-col w-full"}>
            <div className={"w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-8 flex flex-col gap-8"}>
              <div className={"flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2"}>
                <div className={"flex flex-col gap-1.5"}>
                  <div className={"flex items-center gap-2 font-caption text-caption text-secondary uppercase tracking-wider font-semibold"}>
                    <span className={"inline-block w-1.5 h-1.5 rounded-full bg-secondary"}>

                    </span>
{" Báo cáo vận hành thời gian thực "}
                  </div>
                  <h1 className={"font-headline-lg text-headline-lg text-on-surface tracking-tight"}>
{"Tổng quan quản trị"}
                  </h1>
                  <p className={"font-body-md text-body-md text-on-surface-variant max-w-2xl"}>
{" Số liệu vận hành cửa hàng và trạng thái đồng bộ hệ thống AI trong ngày. "}
                  </p>
                </div>
                <div className={"flex items-center gap-3 shrink-0"}>
                  <button className={"inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all active:scale-95 shadow-sm"} id={"btn-sync-ai"} type="button">
                    <span className={"material-symbols-outlined text-[19px] text-secondary"}>
{"sync"}
                    </span>
                    <span>
{"Đồng bộ dữ liệu AI"}
                    </span>
                  </button>
                  <button className={"inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all active:scale-95 shadow-sm"} type="button">
                    <span className={"material-symbols-outlined text-[19px]"}>
{"add"}
                    </span>
                    <span>
{"Thêm sản phẩm mới"}
                    </span>
                  </button>
                </div>
              </div>
              <div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"}>
                <div className={"p-5 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-md"}>
                  <div className={"flex items-center justify-between"}>
                    <span className={"font-label-md text-label-md text-on-surface-variant font-medium"}>
{"Tổng sản phẩm"}
                    </span>
                    <div className={"w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary"}>
                      <span className={"material-symbols-outlined text-[20px]"}>
{"smartphone"}
                      </span>
                    </div>
                  </div>
                  <div className={"flex flex-col gap-1"}>
                    <div className={"flex items-baseline gap-2"}>
                      <span className={"font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight"}>
{"24"}
                      </span>
                      <span className={"font-label-sm text-label-sm text-on-surface-variant"}>
{"thiết bị"}
                      </span>
                    </div>
                    <span className={"font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5"}>
                      <span className={"inline-block w-1.5 h-1.5 rounded-full bg-primary-container"}>

                      </span>
{" 22 đang mở bán • 2 tạm ẩn "}
                    </span>
                  </div>
                </div>
                <div className={"p-5 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-md"}>
                  <div className={"flex items-center justify-between"}>
                    <span className={"font-label-md text-label-md text-on-surface-variant font-medium"}>
{"Tổng đơn hàng"}
                    </span>
                    <div className={"w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-secondary"}>
                      <span className={"material-symbols-outlined text-[20px]"}>
{"shopping_bag"}
                      </span>
                    </div>
                  </div>
                  <div className={"flex flex-col gap-1"}>
                    <div className={"flex items-baseline gap-2"}>
                      <span className={"font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight"}>
{"158"}
                      </span>
                      <span className={"font-label-sm text-label-sm text-on-surface-variant"}>
{"đơn"}
                      </span>
                    </div>
                    <div className={"font-body-sm text-body-sm text-secondary flex items-center gap-1 font-medium"}>
                      <span className={"material-symbols-outlined text-[16px]"}>
{"trending_up"}
                      </span>
{" Hôm nay: +12 đơn mới "}
                    </div>
                  </div>
                </div>
                <div className={"p-5 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-md"}>
                  <div className={"flex items-center justify-between"}>
                    <span className={"font-label-md text-label-md text-on-surface-variant font-medium"}>
{"Đơn chờ xác nhận"}
                    </span>
                    <div className={"w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary"}>
                      <span className={"material-symbols-outlined text-[20px]"}>
{"schedule"}
                      </span>
                    </div>
                  </div>
                  <div className={"flex flex-col gap-1"}>
                    <div className={"flex items-baseline gap-2"}>
                      <span className={"font-headline-lg text-headline-lg text-tertiary font-semibold tracking-tight"}>
{"8"}
                      </span>
                      <span className={"px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold"}>
{"Ưu tiên cao"}
                      </span>
                    </div>
                    <span className={"font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1"}>
                      <span className={"material-symbols-outlined text-[15px] text-tertiary-container"}>
{"priority_high"}
                      </span>
{" Cần gọi khách xác nhận COD "}
                    </span>
                  </div>
                </div>
                <div className={"p-5 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-md"}>
                  <div className={"flex items-center justify-between"}>
                    <span className={"font-label-md text-label-md text-on-surface-variant font-medium"}>
{"Đơn đã hoàn thành"}
                    </span>
                    <div className={"w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary-container"}>
                      <span className={"material-symbols-outlined text-[20px]"}>
{"check_circle"}
                      </span>
                    </div>
                  </div>
                  <div className={"flex flex-col gap-1"}>
                    <div className={"flex items-baseline gap-2"}>
                      <span className={"font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight"}>
{"134"}
                      </span>
                      <span className={"font-label-sm text-label-sm text-on-surface-variant"}>
{"đơn COD"}
                      </span>
                    </div>
                    <span className={"font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5"}>
                      <span className={"material-symbols-outlined text-[15px] text-primary"}>
{"verified"}
                      </span>
{" Tỉ lệ giao thành công 94.2% "}
                    </span>
                  </div>
                </div>
              </div>
              <div className={"grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"}>
                <div className={"lg:col-span-8 flex flex-col gap-4 bg-surface-container-lowest p-6 rounded-2xl shadow-sm"}>
                  <div className={"flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2"}>
                    <div>
                      <h2 className={"font-headline-sm text-headline-sm text-on-surface font-semibold"}>
{"Đơn hàng COD cần xử lý gần đây"}
                      </h2>
                      <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"Duyệt & kích hoạt xuất kho kiểm hàng trực tiếp tại nhà"}
                      </p>
                    </div>
                    <a className={"inline-flex items-center gap-1.5 text-primary hover:text-primary-container font-label-md text-label-md font-medium transition-colors"} href={"#"}>
                      <span>
{"Xem tất cả đơn hàng"}
                      </span>
                      <span className={"material-symbols-outlined text-[18px]"}>
{"chevron_right"}
                      </span>
                    </a>
                  </div>
                  <div className={"overflow-x-auto"}>
                    <table className={"w-full text-left border-collapse"}>
                      <thead>
                        <tr className={"bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm"}>
                          <th className={"py-3 px-4 rounded-l-xl font-medium"}>
{"MÃ ĐƠN"}
                          </th>
                          <th className={"py-3 px-4 font-medium"}>
{"KHÁCH HÀNG"}
                          </th>
                          <th className={"py-3 px-4 font-medium"}>
{"SẢN PHẨM"}
                          </th>
                          <th className={"py-3 px-4 font-medium"}>
{"TỔNG TIỀN"}
                          </th>
                          <th className={"py-3 px-4 font-medium"}>
{"TRẠNG THÁI"}
                          </th>
                          <th className={"py-3 px-4 rounded-r-xl font-medium text-right"}>
{"THAO TÁC"}
                          </th>
                        </tr>
                      </thead>
                      <tbody className={"divide-y-0 text-on-surface font-body-sm text-body-sm"}>
                        <tr className={"hover:bg-surface-container/60 transition-colors group"}>
                          <td className={"py-4 px-4 font-label-md text-label-md text-primary font-semibold whitespace-nowrap"}>
{" #SMAI-89240 "}
                          </td>
                          <td className={"py-4 px-4"}>
                            <div className={"flex flex-col"}>
                              <span className={"font-label-md text-label-md text-on-surface font-medium"}>
{"Nguyễn Minh Hoàng"}
                              </span>
                              <span className={"font-caption text-caption text-on-surface-variant"}>
{"0912 ••• 882"}
                              </span>
                            </div>
                          </td>
                          <td className={"py-4 px-4"}>
                            <div className={"flex items-center gap-3"}>
                              <img className={"w-9 h-9 rounded-lg object-contain bg-surface-container-high p-1 shrink-0"} data-alt={"Titanium Desert iPhone 16 Pro Max front side studio lighting minimal background"} src={"/images/fac1ac1294e0e6a0.webp"} alt={"Titanium Desert iPhone 16 Pro Max front side studio lighting minimal background"} />
                              <span className={"truncate max-w-[180px] font-medium"} title={"iPhone 16 Pro Max 256GB"}>
{"iPhone 16 Pro Max 256GB"}
                              </span>
                            </div>
                          </td>
                          <td className={"py-4 px-4 font-label-md text-label-md font-semibold text-on-surface whitespace-nowrap"}>
{" 34.990.000₫ "}
                          </td>
                          <td className={"py-4 px-4 whitespace-nowrap"}>
                            <span className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold"}>
                              <span className={"w-1.5 h-1.5 rounded-full bg-tertiary"}>

                              </span>
{" Chờ xác nhận "}
                            </span>
                          </td>
                          <td className={"py-4 px-4 text-right whitespace-nowrap"}>
                            <div className={"flex items-center justify-end gap-2"}>
                              <button className={"px-2.5 py-1 rounded-lg bg-primary-fixed hover:bg-primary text-on-primary-fixed hover:text-on-primary font-label-sm text-label-sm font-medium transition-colors"} type="button">
{" Xác nhận "}
                              </button>
                              <button className={"w-7 h-7 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"} title={"Xem chi tiết"} type="button">
                                <span className={"material-symbols-outlined text-[18px]"}>
{"more_vert"}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                        <tr className={"hover:bg-surface-container/60 transition-colors group"}>
                          <td className={"py-4 px-4 font-label-md text-label-md text-primary font-semibold whitespace-nowrap"}>
{" #SMAI-89239 "}
                          </td>
                          <td className={"py-4 px-4"}>
                            <div className={"flex flex-col"}>
                              <span className={"font-label-md text-label-md text-on-surface font-medium"}>
{"Lê Thu Trang"}
                              </span>
                              <span className={"font-caption text-caption text-on-surface-variant"}>
{"0983 ••• 194"}
                              </span>
                            </div>
                          </td>
                          <td className={"py-4 px-4"}>
                            <div className={"flex items-center gap-3"}>
                              <img className={"w-9 h-9 rounded-lg object-contain bg-surface-container-high p-1 shrink-0"} data-alt={"Samsung Galaxy S24 Ultra Titanium Gray modern premium high tech smartphone product shot"} src={"/images/7dc0d3296fa2eaa7.webp"} alt={"Samsung Galaxy S24 Ultra Titanium Gray modern premium high tech smartphone product shot"} />
                              <span className={"truncate max-w-[180px] font-medium"} title={"Galaxy S24 Ultra 512GB"}>
{"Galaxy S24 Ultra 512GB"}
                              </span>
                            </div>
                          </td>
                          <td className={"py-4 px-4 font-label-md text-label-md font-semibold text-on-surface whitespace-nowrap"}>
{" 28.490.000₫ "}
                          </td>
                          <td className={"py-4 px-4 whitespace-nowrap"}>
                            <span className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold"}>
                              <span className={"w-1.5 h-1.5 rounded-full bg-tertiary"}>

                              </span>
{" Chờ xác nhận "}
                            </span>
                          </td>
                          <td className={"py-4 px-4 text-right whitespace-nowrap"}>
                            <div className={"flex items-center justify-end gap-2"}>
                              <button className={"px-2.5 py-1 rounded-lg bg-primary-fixed hover:bg-primary text-on-primary-fixed hover:text-on-primary font-label-sm text-label-sm font-medium transition-colors"} type="button">
{" Xác nhận "}
                              </button>
                              <button className={"w-7 h-7 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"} title={"Xem chi tiết"} type="button">
                                <span className={"material-symbols-outlined text-[18px]"}>
{"more_vert"}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                        <tr className={"hover:bg-surface-container/60 transition-colors group"}>
                          <td className={"py-4 px-4 font-label-md text-label-md text-primary font-semibold whitespace-nowrap"}>
{" #SMAI-89238 "}
                          </td>
                          <td className={"py-4 px-4"}>
                            <div className={"flex flex-col"}>
                              <span className={"font-label-md text-label-md text-on-surface font-medium"}>
{"Trần Đức Nam"}
                              </span>
                              <span className={"font-caption text-caption text-on-surface-variant"}>
{"0905 ••• 563"}
                              </span>
                            </div>
                          </td>
                          <td className={"py-4 px-4"}>
                            <div className={"flex items-center gap-3"}>
                              <img className={"w-9 h-9 rounded-lg object-contain bg-surface-container-high p-1 shrink-0"} data-alt={"Xiaomi 14 Ultra White Leica optics flagship phone isolated clear backdrop"} src={"/images/2b477a6b34359539.webp"} alt={"Xiaomi 14 Ultra White Leica optics flagship phone isolated clear backdrop"} />
                              <span className={"truncate max-w-[180px] font-medium"} title={"Xiaomi 14 Ultra 512GB"}>
{"Xiaomi 14 Ultra 512GB"}
                              </span>
                            </div>
                          </td>
                          <td className={"py-4 px-4 font-label-md text-label-md font-semibold text-on-surface whitespace-nowrap"}>
{" 29.990.000₫ "}
                          </td>
                          <td className={"py-4 px-4 whitespace-nowrap"}>
                            <span className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-caption text-caption font-semibold"}>
                              <span className={"w-1.5 h-1.5 rounded-full bg-primary"}>

                              </span>
{" Đã xác nhận "}
                            </span>
                          </td>
                          <td className={"py-4 px-4 text-right whitespace-nowrap"}>
                            <div className={"flex items-center justify-end gap-2"}>
                              <button className={"px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium transition-colors"} type="button">
{" Chi tiết "}
                              </button>
                              <button className={"w-7 h-7 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"} title={"Xem chi tiết"} type="button">
                                <span className={"material-symbols-outlined text-[18px]"}>
{"more_vert"}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                        <tr className={"hover:bg-surface-container/60 transition-colors group"}>
                          <td className={"py-4 px-4 font-label-md text-label-md text-primary font-semibold whitespace-nowrap"}>
{" #SMAI-89237 "}
                          </td>
                          <td className={"py-4 px-4"}>
                            <div className={"flex flex-col"}>
                              <span className={"font-label-md text-label-md text-on-surface font-medium"}>
{"Vũ Hồng Anh"}
                              </span>
                              <span className={"font-caption text-caption text-on-surface-variant"}>
{"0977 ••• 412"}
                              </span>
                            </div>
                          </td>
                          <td className={"py-4 px-4"}>
                            <div className={"flex items-center gap-3"}>
                              <img className={"w-9 h-9 rounded-lg object-contain bg-surface-container-high p-1 shrink-0"} data-alt={"Google Pixel 9 Pro Porcelain clean minimal aesthetic high tech smartphone render"} src={"/images/6ab51f0cb4eddfa9.webp"} alt={"Google Pixel 9 Pro Porcelain clean minimal aesthetic high tech smartphone render"} />
                              <span className={"truncate max-w-[180px] font-medium"} title={"Pixel 9 Pro XL 128GB"}>
{"Pixel 9 Pro XL 128GB"}
                              </span>
                            </div>
                          </td>
                          <td className={"py-4 px-4 font-label-md text-label-md font-semibold text-on-surface whitespace-nowrap"}>
{" 26.790.000₫ "}
                          </td>
                          <td className={"py-4 px-4 whitespace-nowrap"}>
                            <span className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold"}>
                              <span className={"w-1.5 h-1.5 rounded-full bg-secondary"}>

                              </span>
{" Đang giao "}
                            </span>
                          </td>
                          <td className={"py-4 px-4 text-right whitespace-nowrap"}>
                            <div className={"flex items-center justify-end gap-2"}>
                              <button className={"px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium transition-colors"} type="button">
{" Theo dõi "}
                              </button>
                              <button className={"w-7 h-7 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"} title={"Xem chi tiết"} type="button">
                                <span className={"material-symbols-outlined text-[18px]"}>
{"more_vert"}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                        <tr className={"hover:bg-surface-container/60 transition-colors group"}>
                          <td className={"py-4 px-4 font-label-md text-label-md text-primary font-semibold whitespace-nowrap"}>
{" #SMAI-89236 "}
                          </td>
                          <td className={"py-4 px-4"}>
                            <div className={"flex flex-col"}>
                              <span className={"font-label-md text-label-md text-on-surface font-medium"}>
{"Phạm Quốc Tuấn"}
                              </span>
                              <span className={"font-caption text-caption text-on-surface-variant"}>
{"0934 ••• 990"}
                              </span>
                            </div>
                          </td>
                          <td className={"py-4 px-4"}>
                            <div className={"flex items-center gap-3"}>
                              <img className={"w-9 h-9 rounded-lg object-contain bg-surface-container-high p-1 shrink-0"} data-alt={"iPhone 16 Pro Natural Titanium studio lighting clean product photo"} src={"/images/2264369474a2526d.webp"} alt={"iPhone 16 Pro Natural Titanium studio lighting clean product photo"} />
                              <span className={"truncate max-w-[180px] font-medium"} title={"iPhone 16 Pro 128GB"}>
{"iPhone 16 Pro 128GB"}
                              </span>
                            </div>
                          </td>
                          <td className={"py-4 px-4 font-label-md text-label-md font-semibold text-on-surface whitespace-nowrap"}>
{" 28.990.000₫ "}
                          </td>
                          <td className={"py-4 px-4 whitespace-nowrap"}>
                            <span className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold"}>
                              <span className={"w-1.5 h-1.5 rounded-full bg-secondary"}>

                              </span>
{" Đang giao "}
                            </span>
                          </td>
                          <td className={"py-4 px-4 text-right whitespace-nowrap"}>
                            <div className={"flex items-center justify-end gap-2"}>
                              <button className={"px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium transition-colors"} type="button">
{" Theo dõi "}
                              </button>
                              <button className={"w-7 h-7 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"} title={"Xem chi tiết"} type="button">
                                <span className={"material-symbols-outlined text-[18px]"}>
{"more_vert"}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className={"p-3.5 bg-surface-container-low rounded-xl flex items-center justify-between mt-2"}>
                    <div className={"flex items-center gap-2"}>
                      <span className={"material-symbols-outlined text-secondary text-[18px]"}>
{"local_shipping"}
                      </span>
                      <span className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"Chính sách vận chuyển: Kiểm tra hàng & mở máy đồng kiểm trước khi nhận tiền COD."}
                      </span>
                    </div>
                    <span className={"font-caption text-caption font-semibold text-on-surface bg-surface-container-lowest px-2 py-0.5 rounded"}>
{"100% COD"}
                    </span>
                  </div>
                </div>
                <div className={"lg:col-span-4 flex flex-col gap-5"}>
                  <div className={"p-6 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-5"}>
                    <div className={"flex items-center justify-between"}>
                      <div className={"flex items-center gap-2.5"}>
                        <div className={"w-9 h-9 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary"}>
                          <span className={"material-symbols-outlined text-[20px]"}>
{"dataset"}
                          </span>
                        </div>
                        <h3 className={"font-headline-sm text-headline-sm text-on-surface font-semibold"}>
{"Kho tri thức AI"}
                        </h3>
                      </div>
                      <span className={"px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-caption text-caption font-semibold"}>
{" RAG Active "}
                      </span>
                    </div>
                    <div className={"p-4 rounded-xl bg-surface-container-low flex items-center justify-between"}>
                      <div className={"flex flex-col"}>
                        <span className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"Vector Database"}
                        </span>
                        <span className={"font-label-md text-label-md text-on-surface font-semibold"}>
{"18 tài liệu đã lập chỉ mục"}
                        </span>
                      </div>
                      <span className={"material-symbols-outlined text-secondary text-[24px]"}>
{"cloud_done"}
                      </span>
                    </div>
                    <div className={"flex flex-col gap-3.5"}>
                      <span className={"font-label-sm text-label-sm text-on-surface-variant font-medium uppercase tracking-wide"}>
{" Đồng bộ tài liệu gần nhất "}
                      </span>
                      <div className={"flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container/50"}>
                        <div className={"flex items-center justify-between"}>
                          <div className={"flex items-center gap-2 truncate"}>
                            <span className={"material-symbols-outlined text-[18px] text-on-surface-variant"}>
{"description"}
                            </span>
                            <span className={"font-label-sm text-label-sm text-on-surface font-medium truncate max-w-[190px]"}>
{"Chính sách bảo hành 12 tháng.pdf"}
                            </span>
                          </div>
                          <span className={"font-caption text-caption text-primary font-semibold"}>
{"100%"}
                          </span>
                        </div>
                        <div className={"w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden"}>
                          <div className={"bg-primary h-full w-full rounded-full"}>

                          </div>
                        </div>
                      </div>
                      <div className={"flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container/50"}>
                        <div className={"flex items-center justify-between"}>
                          <div className={"flex items-center gap-2 truncate"}>
                            <span className={"material-symbols-outlined text-[18px] text-on-surface-variant"}>
{"description"}
                            </span>
                            <span className={"font-label-sm text-label-sm text-on-surface font-medium truncate max-w-[190px]"}>
{"Quy trình COD & Đồng kiểm.pdf"}
                            </span>
                          </div>
                          <span className={"font-caption text-caption text-primary font-semibold"}>
{"100%"}
                          </span>
                        </div>
                        <div className={"w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden"}>
                          <div className={"bg-primary h-full w-full rounded-full"}>

                          </div>
                        </div>
                      </div>
                      <div className={"flex flex-col gap-1.5 p-3 rounded-xl bg-secondary-fixed/40"}>
                        <div className={"flex items-center justify-between"}>
                          <div className={"flex items-center gap-2 truncate"}>
                            <span className={"material-symbols-outlined text-[18px] text-secondary"}>
{"sync"}
                            </span>
                            <span className={"font-label-sm text-label-sm text-on-surface font-medium truncate max-w-[190px]"}>
{"Thông số iPhone 16 Series.pdf"}
                            </span>
                          </div>
                          <span className={"font-caption text-caption text-secondary font-semibold"}>
{"68%"}
                          </span>
                        </div>
                        <div className={"w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden"}>
                          <div className={"bg-secondary h-full w-[68%] rounded-full transition-all duration-500"}>

                          </div>
                        </div>
                        <span className={"font-caption text-caption text-secondary font-medium"}>
{"Đang trích xuất chunks & embeddings..."}
                        </span>
                      </div>
                    </div>
                    <div className={"pt-3 border-t border-surface-container-high flex flex-col gap-2.5"}>
                      <span className={"font-label-sm text-label-sm text-on-surface-variant font-medium"}>
{"Trạng thái kết nối LLM"}
                      </span>
                      <div className={"flex items-center justify-between"}>
                        <div className={"flex items-center gap-2"}>
                          <span className={"w-2 h-2 rounded-full bg-primary"}>

                          </span>
                          <span className={"font-body-sm text-body-sm font-medium text-on-surface"}>
{"OpenAI GPT-4o"}
                          </span>
                        </div>
                        <span className={"font-caption text-caption text-primary font-medium bg-primary-fixed px-2 py-0.5 rounded"}>
{"Active (42ms)"}
                        </span>
                      </div>
                      <div className={"flex items-center justify-between"}>
                        <div className={"flex items-center gap-2"}>
                          <span className={"w-2 h-2 rounded-full bg-secondary"}>

                          </span>
                          <span className={"font-body-sm text-body-sm font-medium text-on-surface"}>
{"Gemini 1.5 Pro"}
                          </span>
                        </div>
                        <span className={"font-caption text-caption text-secondary font-medium bg-secondary-fixed px-2 py-0.5 rounded"}>
{"Sẵn sàng (Dự phòng)"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={"grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 pb-8"}>
                <a className={"p-6 rounded-2xl bg-surface-container-lowest hover:bg-surface-container-low shadow-sm flex items-center justify-between gap-4 transition-all group"} href={"#"}>
                  <div className={"flex items-center gap-4"}>
                    <div className={"w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-105 transition-transform"}>
                      <span className={"material-symbols-outlined text-[24px]"}>
{"inventory_2"}
                      </span>
                    </div>
                    <div className={"flex flex-col"}>
                      <span className={"font-headline-sm text-headline-sm text-on-surface font-semibold"}>
{"Quản lý sản phẩm & biến thể"}
                      </span>
                      <span className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"Cập nhật giá, màu sắc, thông số kỹ thuật điện thoại"}
                      </span>
                    </div>
                  </div>
                  <div className={"w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface group-hover:bg-primary group-hover:text-on-primary transition-colors"}>
                    <span className={"material-symbols-outlined text-[20px]"}>
{"arrow_forward"}
                    </span>
                  </div>
                </a>
                <a className={"p-6 rounded-2xl bg-surface-container-lowest hover:bg-surface-container-low shadow-sm flex items-center justify-between gap-4 transition-all group"} href={"#"}>
                  <div className={"flex items-center gap-4"}>
                    <div className={"w-12 h-12 rounded-2xl bg-secondary-fixed flex items-center justify-center text-secondary group-hover:scale-105 transition-transform"}>
                      <span className={"material-symbols-outlined text-[24px]"}>
{"tune"}
                      </span>
                    </div>
                    <div className={"flex flex-col"}>
                      <span className={"font-headline-sm text-headline-sm text-on-surface font-semibold"}>
{"Cấu hình nhà cung cấp AI"}
                      </span>
                      <span className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"Quản lý API Key, System Prompt và quy tắc gợi ý mua hàng"}
                      </span>
                    </div>
                  </div>
                  <div className={"w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface group-hover:bg-secondary group-hover:text-on-secondary transition-colors"}>
                    <span className={"material-symbols-outlined text-[20px]"}>
{"arrow_forward"}
                    </span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
