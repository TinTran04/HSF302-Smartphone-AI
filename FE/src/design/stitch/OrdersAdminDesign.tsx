// Converted from qu_n_l_n_h_ng_smartphone_ai_admin/code.html. Read-only design reference.
// Inline scripts were replaced by React state in src/pages and src/features.
export default function OrdersAdminDesign() {
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
            <a className={"flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"} data-path={"tong-quan"} href={"#"}>
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
            <a aria-current={"page"} className={"flex items-center gap-3 px-3.5 py-2.5 transition-all bg-primary text-on-primary font-medium rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)]"} data-path={"quan-ly-don-hang"} href={"#"}>
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
            <div className={"px-8 py-8 flex flex-col gap-8 max-w-[1600px] mx-auto w-full"}>
              <div className={"flex flex-col gap-6"}>
                <div className={"flex flex-col md:flex-row md:items-end justify-between gap-4"}>
                  <div className={"flex flex-col gap-1.5"}>
                    <div className={"flex items-center gap-2"}>
                      <span className={"px-2.5 py-0.5 rounded-full bg-secondary-fixed text-secondary font-label-sm text-label-sm font-semibold tracking-wide uppercase"}>
{"Bộ phận vận hành COD"}
                      </span>
                      <span className={"w-1.5 h-1.5 rounded-full bg-outline-variant"}>

                      </span>
                      <span className={"font-caption text-caption text-on-surface-variant"}>
{"Quy trình giao hàng nội bộ & thu tiền mặt"}
                      </span>
                    </div>
                    <h1 className={"font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight"}>
{"Quản lý đơn hàng COD"}
                    </h1>
                    <p className={"font-body-md text-body-md text-on-surface-variant max-w-2xl"}>
{"Theo dõi, xác nhận điện thoại và cập nhật trạng thái đơn hàng nhận tiền mặt tận nơi"}
                    </p>
                  </div>
                  <div className={"flex items-center gap-3"}>
                    <div className={"px-4 py-3 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-3"}>
                      <div className={"w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary"}>
                        <span className={"material-symbols-outlined text-[22px]"}>
{"payments"}
                        </span>
                      </div>
                      <div className={"flex flex-col"}>
                        <span className={"font-caption text-caption text-on-surface-variant"}>
{"Tổng tiền COD chờ thu"}
                        </span>
                        <span className={"font-headline-sm text-headline-sm font-semibold text-on-surface"}>
{"184.450.000đ"}
                        </span>
                      </div>
                    </div>
                    <div className={"px-4 py-3 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-3"}>
                      <div className={"w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary"}>
                        <span className={"material-symbols-outlined text-[22px]"}>
{"call_log"}
                        </span>
                      </div>
                      <div className={"flex flex-col"}>
                        <span className={"font-caption text-caption text-on-surface-variant"}>
{"Cần gọi xác thực"}
                        </span>
                        <span className={"font-headline-sm text-headline-sm font-semibold text-secondary"}>
{"8 cuộc gọi"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={"flex items-center gap-2 overflow-x-auto pb-1"}>
                  <button className={"px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-medium shadow-sm flex items-center gap-2 shrink-0 transition-transform active:scale-95"} type="button">
                    <span>
{"Tất cả"}
                    </span>
                    <span className={"px-1.5 py-0.5 rounded-full bg-white/20 font-caption text-caption font-semibold"}>
{"158"}
                    </span>
                  </button>
                  <button className={"px-4 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-tertiary-container font-label-md text-label-md font-medium shadow-sm flex items-center gap-2 shrink-0 transition-all"} type="button">
                    <span className={"w-2 h-2 rounded-full bg-tertiary-container animate-ping"}>

                    </span>
                    <span>
{"Chờ xác nhận"}
                    </span>
                    <span className={"px-2 py-0.5 rounded-full bg-on-tertiary-container font-caption text-caption font-semibold"}>
{"8"}
                    </span>
                  </button>
                  <button className={"px-4 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-primary font-label-md text-label-md font-medium shadow-sm flex items-center gap-2 shrink-0 transition-all"} type="button">
                    <span>
{"Đã xác nhận"}
                    </span>
                    <span className={"px-2 py-0.5 rounded-full bg-primary-fixed font-caption text-caption font-semibold"}>
{"14"}
                    </span>
                  </button>
                  <button className={"px-4 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-secondary font-label-md text-label-md font-medium shadow-sm flex items-center gap-2 shrink-0 transition-all"} type="button">
                    <span>
{"Đang giao"}
                    </span>
                    <span className={"px-2 py-0.5 rounded-full bg-secondary-fixed font-caption text-caption font-semibold"}>
{"12"}
                    </span>
                  </button>
                  <button className={"px-4 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md font-medium shadow-sm flex items-center gap-2 shrink-0 transition-all"} type="button">
                    <span>
{"Hoàn thành"}
                    </span>
                    <span className={"px-2 py-0.5 rounded-full bg-surface-container font-caption text-caption font-semibold"}>
{"118"}
                    </span>
                  </button>
                  <button className={"px-4 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-error font-label-md text-label-md font-medium shadow-sm flex items-center gap-2 shrink-0 transition-all"} type="button">
                    <span>
{"Đã hủy"}
                    </span>
                    <span className={"px-2 py-0.5 rounded-full bg-error-container font-caption text-caption font-semibold"}>
{"6"}
                    </span>
                  </button>
                </div>
              </div>
              <div className={"p-4 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4"}>
                <div className={"flex-1 flex items-center gap-3 bg-surface-container-low px-4 py-2.5 rounded-xl"}>
                  <span className={"material-symbols-outlined text-[20px] text-on-surface-variant"}>
{"search"}
                  </span>
                  <input className={"bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline w-full focus:outline-none"} placeholder={"Tìm mã đơn hàng, tên khách hàng, số điện thoại..."} type={"text"} />
                  <span className={"font-caption text-caption text-outline-variant bg-surface-container-lowest px-2 py-0.5 rounded"}>
{"⌘K"}
                  </span>
                </div>
                <div className={"flex items-center gap-3 shrink-0"}>
                  <div className={"flex items-center gap-2 bg-surface-container-low px-3.5 py-2.5 rounded-xl"}>
                    <span className={"material-symbols-outlined text-[18px] text-primary"}>
{"calendar_today"}
                    </span>
                    <span className={"font-label-md text-label-md text-on-surface font-medium"}>
{"Hôm nay: 24/10/2025"}
                    </span>
                  </div>
                  <button className={"px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-dim font-label-md text-label-md text-on-surface flex items-center gap-2 transition-colors"} type="button">
                    <span className={"material-symbols-outlined text-[18px]"}>
{"filter_list"}
                    </span>
                    <span>
{"Lọc khu vực"}
                    </span>
                  </button>
                  <button className={"px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-dim font-label-md text-label-md text-on-surface flex items-center gap-2 transition-colors"} type="button">
                    <span className={"material-symbols-outlined text-[18px]"}>
{"file_download"}
                    </span>
                    <span>
{"Xuất danh sách"}
                    </span>
                  </button>
                </div>
              </div>
              <div className={"grid grid-cols-1 xl:grid-cols-12 gap-8 items-start"}>
                <div className={"xl:col-span-7 flex flex-col gap-4"}>
                  <div className={"bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden"}>
                    <div className={"px-6 py-4 flex items-center justify-between bg-surface-container-low/50"}>
                      <div className={"flex items-center gap-2"}>
                        <span className={"font-headline-sm text-label-md text-on-surface font-semibold"}>
{"Danh sách đơn COD cần xử lý"}
                        </span>
                        <span className={"px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-caption text-caption font-semibold"}>
{"Real-time"}
                        </span>
                      </div>
                      <span className={"font-caption text-caption text-on-surface-variant"}>
{"Hiển thị 5 trên 158 đơn"}
                      </span>
                    </div>
                    <div className={"overflow-x-auto"}>
                      <table className={"w-full text-left font-body-sm text-body-sm"}>
                        <thead className={"bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm"}>
                          <tr>
                            <th className={"py-3.5 px-4 font-semibold"}>
{"Mã đơn & COD"}
                            </th>
                            <th className={"py-3.5 px-4 font-semibold"}>
{"Khách hàng"}
                            </th>
                            <th className={"py-3.5 px-4 font-semibold"}>
{"Sản phẩm"}
                            </th>
                            <th className={"py-3.5 px-4 font-semibold"}>
{"Tổng tiền"}
                            </th>
                            <th className={"py-3.5 px-4 font-semibold"}>
{"Trạng thái"}
                            </th>
                            <th className={"py-3.5 px-4 text-right font-semibold"}>
{"Thao tác"}
                            </th>
                          </tr>
                        </thead>
                        <tbody className={"text-on-surface divide-y-0"}>
                          <tr className={"bg-secondary-fixed/20 hover:bg-secondary-fixed/30 transition-colors cursor-pointer"}>
                            <td className={"py-4 px-4 align-top"}>
                              <div className={"flex flex-col gap-1"}>
                                <span className={"font-label-md text-label-md text-primary font-semibold"}>
{"#SMAI-89240"}
                                </span>
                                <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-caption text-caption w-fit font-medium"}>
                                  <span className={"material-symbols-outlined text-[13px] text-tertiary-container"}>
{"local_atm"}
                                  </span>
{" COD 100% "}
                                </span>
                                <span className={"font-caption text-caption text-outline"}>
{"10:45 hôm nay"}
                                </span>
                              </div>
                            </td>
                            <td className={"py-4 px-4 align-top"}>
                              <div className={"flex flex-col gap-0.5"}>
                                <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"Nguyễn Minh Hoàng"}
                                </span>
                                <a className={"font-body-sm text-body-sm text-secondary hover:underline flex items-center gap-1"} href={"tel:0912345678"}>
                                  <span className={"material-symbols-outlined text-[14px]"}>
{"call"}
                                  </span>
{" 0912 345 678 "}
                                </a>
                                <span className={"font-caption text-caption text-on-surface-variant"}>
{"Cầu Giấy, Hà Nội"}
                                </span>
                              </div>
                            </td>
                            <td className={"py-4 px-4 align-top"}>
                              <div className={"flex items-center gap-2.5"}>
                                <img className={"w-10 h-10 rounded-lg object-cover bg-surface-container shrink-0"} data-alt={"Close up studio product render of iPhone 16 Pro Max in Natural Titanium finish highlighting ceramic glass and brushed titanium borders, high-end commercial tech aesthetic"} src={"/images/7df25d7d786a2b72.webp"} alt={"Close up studio product render of iPhone 16 Pro Max in Natural Titanium finish highlighting ceramic glass and brushed titanium borders, high-end commercial tech"} />
                                <div className={"flex flex-col min-w-0"}>
                                  <span className={"font-label-sm text-label-sm font-medium text-on-surface truncate"}>
{"iPhone 16 Pro Max"}
                                  </span>
                                  <span className={"font-caption text-caption text-on-surface-variant"}>
{"256GB Titan Tự Nhiên × 1"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className={"py-4 px-4 align-top"}>
                              <div className={"flex flex-col"}>
                                <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"34.990.000đ"}
                                </span>
                                <span className={"font-caption text-caption text-outline"}>
{"Miễn phí thu hộ"}
                                </span>
                              </div>
                            </td>
                            <td className={"py-4 px-4 align-top"}>
                              <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-on-tertiary-container text-tertiary-container font-label-sm text-label-sm font-semibold"}>
                                <span className={"w-1.5 h-1.5 rounded-full bg-tertiary-container"}>

                                </span>
{" Chờ xác nhận "}
                              </span>
                            </td>
                            <td className={"py-4 px-4 align-top text-right"}>
                              <div className={"flex items-center justify-end gap-1"}>
                                <button className={"p-1.5 rounded-lg bg-surface-container-lowest text-secondary hover:bg-secondary-fixed transition-colors"} title={"Gọi khách"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"phone_in_talk"}
                                  </span>
                                </button>
                                <button className={"p-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors"} title={"Xem chi tiết"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"visibility"}
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr className={"hover:bg-surface-container-low transition-colors cursor-pointer"}>
                            <td className={"py-4 px-4 align-top"}>
                              <div className={"flex flex-col gap-1"}>
                                <span className={"font-label-md text-label-md text-on-surface font-semibold"}>
{"#SMAI-89239"}
                                </span>
                                <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-caption text-caption w-fit font-medium"}>
                                  <span className={"material-symbols-outlined text-[13px] text-tertiary-container"}>
{"local_atm"}
                                  </span>
{" COD 100% "}
                                </span>
                                <span className={"font-caption text-caption text-outline"}>
{"10:12 hôm nay"}
                                </span>
                              </div>
                            </td>
                            <td className={"py-4 px-4 align-top"}>
                              <div className={"flex flex-col gap-0.5"}>
                                <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"Trần Khánh Ly"}
                                </span>
                                <span className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"0987 654 321"}
                                </span>
                                <span className={"font-caption text-caption text-on-surface-variant"}>
{"Quận 1, TP. Hồ Chí Minh"}
                                </span>
                              </div>
                            </td>
                            <td className={"py-4 px-4 align-top"}>
                              <div className={"flex items-center gap-2.5"}>
                                <img className={"w-10 h-10 rounded-lg object-cover bg-surface-container shrink-0"} data-alt={"Samsung Galaxy S24 Ultra Titanium Gray smartphone mockup on pristine studio background soft diffused luxury lighting"} src={"/images/e960e6e3845e0185.webp"} alt={"Samsung Galaxy S24 Ultra Titanium Gray smartphone mockup on pristine studio background soft diffused luxury lighting"} />
                                <div className={"flex flex-col min-w-0"}>
                                  <span className={"font-label-sm text-label-sm font-medium text-on-surface truncate"}>
{"Galaxy S24 Ultra"}
                                  </span>
                                  <span className={"font-caption text-caption text-on-surface-variant"}>
{"512GB Xám Titan × 1"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className={"py-4 px-4 align-top"}>
                              <div className={"flex flex-col"}>
                                <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"31.490.000đ"}
                                </span>
                                <span className={"font-caption text-caption text-outline"}>
{"Miễn phí thu hộ"}
                                </span>
                              </div>
                            </td>
                            <td className={"py-4 px-4 align-top"}>
                              <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-semibold"}>
                                <span className={"w-1.5 h-1.5 rounded-full bg-primary"}>

                                </span>
{" Đã xác nhận "}
                              </span>
                            </td>
                            <td className={"py-4 px-4 align-top text-right"}>
                              <div className={"flex items-center justify-end gap-1"}>
                                <button className={"p-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-colors"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"phone_in_talk"}
                                  </span>
                                </button>
                                <button className={"p-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-colors"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"visibility"}
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr className={"hover:bg-surface-container-low transition-colors cursor-pointer"}>
                            <td className={"py-4 px-4 align-top"}>
                              <div className={"flex flex-col gap-1"}>
                                <span className={"font-label-md text-label-md text-on-surface font-semibold"}>
{"#SMAI-89238"}
                                </span>
                                <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-caption text-caption w-fit font-medium"}>
                                  <span className={"material-symbols-outlined text-[13px] text-tertiary-container"}>
{"local_atm"}
                                  </span>
{" COD 100% "}
                                </span>
                                <span className={"font-caption text-caption text-outline"}>
{"09:40 hôm nay"}
                                </span>
                              </div>
                            </td>
                            <td className={"py-4 px-4 align-top"}>
                              <div className={"flex flex-col gap-0.5"}>
                                <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"Lê Văn Dũng"}
                                </span>
                                <span className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"0903 112 233"}
                                </span>
                                <span className={"font-caption text-caption text-on-surface-variant"}>
{"Hải Châu, Đà Nẵng"}
                                </span>
                              </div>
                            </td>
                            <td className={"py-4 px-4 align-top"}>
                              <div className={"flex items-center gap-2.5"}>
                                <img className={"w-10 h-10 rounded-lg object-cover bg-surface-container shrink-0"} data-alt={"Google Pixel 9 Pro Obsidian Black smartphone studio flatlay render with subtle glass reflection"} src={"/images/ddec6bddc1cacedd.webp"} alt={"Google Pixel 9 Pro Obsidian Black smartphone studio flatlay render with subtle glass reflection"} />
                                <div className={"flex flex-col min-w-0"}>
                                  <span className={"font-label-sm text-label-sm font-medium text-on-surface truncate"}>
{"Pixel 9 Pro"}
                                  </span>
                                  <span className={"font-caption text-caption text-on-surface-variant"}>
{"128GB Obsidian × 1"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className={"py-4 px-4 align-top"}>
                              <div className={"flex flex-col"}>
                                <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"26.990.000đ"}
                                </span>
                                <span className={"font-caption text-caption text-outline"}>
{"Miễn phí thu hộ"}
                                </span>
                              </div>
                            </td>
                            <td className={"py-4 px-4 align-top"}>
                              <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-fixed text-secondary font-label-sm text-label-sm font-semibold"}>
                                <span className={"w-1.5 h-1.5 rounded-full bg-secondary"}>

                                </span>
{" Đang giao "}
                              </span>
                            </td>
                            <td className={"py-4 px-4 align-top text-right"}>
                              <div className={"flex items-center justify-end gap-1"}>
                                <button className={"p-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-colors"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"phone_in_talk"}
                                  </span>
                                </button>
                                <button className={"p-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-colors"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"visibility"}
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr className={"hover:bg-surface-container-low transition-colors cursor-pointer"}>
                            <td className={"py-4 px-4 align-top"}>
                              <div className={"flex flex-col gap-1"}>
                                <span className={"font-label-md text-label-md text-on-surface font-semibold"}>
{"#SMAI-89235"}
                                </span>
                                <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-caption text-caption w-fit font-medium"}>
                                  <span className={"material-symbols-outlined text-[13px] text-tertiary-container"}>
{"local_atm"}
                                  </span>
{" COD 100% "}
                                </span>
                                <span className={"font-caption text-caption text-outline"}>
{"08:15 hôm nay"}
                                </span>
                              </div>
                            </td>
                            <td className={"py-4 px-4 align-top"}>
                              <div className={"flex flex-col gap-0.5"}>
                                <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"Vũ Quỳnh Như"}
                                </span>
                                <span className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"0945 998 877"}
                                </span>
                                <span className={"font-caption text-caption text-on-surface-variant"}>
{"Thanh Xuân, Hà Nội"}
                                </span>
                              </div>
                            </td>
                            <td className={"py-4 px-4 align-top"}>
                              <div className={"flex items-center gap-2.5"}>
                                <img className={"w-10 h-10 rounded-lg object-cover bg-surface-container shrink-0"} data-alt={"Xiaomi 14 Ultra White camera phone flagship studio product view clean minimalistic composition"} src={"/images/ddc61027740392c7.webp"} alt={"Xiaomi 14 Ultra White camera phone flagship studio product view clean minimalistic composition"} />
                                <div className={"flex flex-col min-w-0"}>
                                  <span className={"font-label-sm text-label-sm font-medium text-on-surface truncate"}>
{"Xiaomi 14 Ultra"}
                                  </span>
                                  <span className={"font-caption text-caption text-on-surface-variant"}>
{"512GB Trắng Gốm × 1"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className={"py-4 px-4 align-top"}>
                              <div className={"flex flex-col"}>
                                <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"29.990.000đ"}
                                </span>
                                <span className={"font-caption text-caption text-outline"}>
{"Miễn phí thu hộ"}
                                </span>
                              </div>
                            </td>
                            <td className={"py-4 px-4 align-top"}>
                              <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold"}>
                                <span className={"w-1.5 h-1.5 rounded-full bg-primary-container"}>

                                </span>
{" Hoàn thành "}
                              </span>
                            </td>
                            <td className={"py-4 px-4 align-top text-right"}>
                              <div className={"flex items-center justify-end gap-1"}>
                                <button className={"p-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-colors"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"phone_in_talk"}
                                  </span>
                                </button>
                                <button className={"p-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-colors"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"visibility"}
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr className={"hover:bg-surface-container-low transition-colors cursor-pointer"}>
                            <td className={"py-4 px-4 align-top"}>
                              <div className={"flex flex-col gap-1"}>
                                <span className={"font-label-md text-label-md text-on-surface font-semibold"}>
{"#SMAI-89230"}
                                </span>
                                <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-caption text-caption w-fit font-medium"}>
                                  <span className={"material-symbols-outlined text-[13px] text-tertiary-container"}>
{"local_atm"}
                                  </span>
{" COD 100% "}
                                </span>
                                <span className={"font-caption text-caption text-outline"}>
{"Hôm qua"}
                                </span>
                              </div>
                            </td>
                            <td className={"py-4 px-4 align-top"}>
                              <div className={"flex flex-col gap-0.5"}>
                                <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"Phạm Quốc Bảo"}
                                </span>
                                <span className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"0938 776 655"}
                                </span>
                                <span className={"font-caption text-caption text-on-surface-variant"}>
{"Bình Thạnh, TP.HCM"}
                                </span>
                              </div>
                            </td>
                            <td className={"py-4 px-4 align-top"}>
                              <div className={"flex items-center gap-2.5"}>
                                <img className={"w-10 h-10 rounded-lg object-cover bg-surface-container shrink-0"} data-alt={"iPhone 15 Pro Blue Titanium minimalist luxury technology product shot"} src={"/images/e0a30a19a6160db5.webp"} alt={"iPhone 15 Pro Blue Titanium minimalist luxury technology product shot"} />
                                <div className={"flex flex-col min-w-0"}>
                                  <span className={"font-label-sm text-label-sm font-medium text-on-surface truncate"}>
{"iPhone 15 Pro"}
                                  </span>
                                  <span className={"font-caption text-caption text-on-surface-variant"}>
{"128GB Titan Xanh × 1"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className={"py-4 px-4 align-top"}>
                              <div className={"flex flex-col"}>
                                <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"24.490.000đ"}
                                </span>
                                <span className={"font-caption text-caption text-outline"}>
{"Miễn phí thu hộ"}
                                </span>
                              </div>
                            </td>
                            <td className={"py-4 px-4 align-top"}>
                              <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-error font-label-sm text-label-sm font-semibold"}>
                                <span className={"w-1.5 h-1.5 rounded-full bg-error"}>

                                </span>
{" Đã hủy "}
                              </span>
                            </td>
                            <td className={"py-4 px-4 align-top text-right"}>
                              <div className={"flex items-center justify-end gap-1"}>
                                <button className={"p-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-colors"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"phone_in_talk"}
                                  </span>
                                </button>
                                <button className={"p-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-colors"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"visibility"}
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className={"p-4 bg-surface-container-low/30 flex items-center justify-between"}>
                      <span className={"font-caption text-caption text-on-surface-variant"}>
{"Đang xem 1 - 5 trong số 158 đơn hàng nhận tiền mặt COD"}
                      </span>
                      <div className={"flex items-center gap-1.5"}>
                        <button className={"w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface-variant flex items-center justify-center hover:bg-surface-container disabled:opacity-50"} disabled={true} type="button">
                          <span className={"material-symbols-outlined text-[18px]"}>
{"chevron_left"}
                          </span>
                        </button>
                        <button className={"w-8 h-8 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center font-medium"} type="button">
{"1"}
                        </button>
                        <button className={"w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface font-label-sm text-label-sm flex items-center justify-center hover:bg-surface-container"} type="button">
{"2"}
                        </button>
                        <button className={"w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface font-label-sm text-label-sm flex items-center justify-center hover:bg-surface-container"} type="button">
{"3"}
                        </button>
                        <span className={"px-1 text-outline"}>
{"..."}
                        </span>
                        <button className={"w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface font-label-sm text-label-sm flex items-center justify-center hover:bg-surface-container"} type="button">
{"32"}
                        </button>
                        <button className={"w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface-variant flex items-center justify-center hover:bg-surface-container"} type="button">
                          <span className={"material-symbols-outlined text-[18px]"}>
{"chevron_right"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className={"p-5 rounded-2xl bg-surface-container-low flex items-start gap-4"}>
                    <div className={"w-10 h-10 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center shrink-0"}>
                      <span className={"material-symbols-outlined text-[20px]"}>
{"verified_user"}
                      </span>
                    </div>
                    <div className={"flex flex-col gap-1"}>
                      <span className={"font-headline-sm text-label-md text-on-surface font-semibold"}>
{"Quy chuẩn chốt đơn COD nội bộ"}
                      </span>
                      <p className={"font-body-sm text-body-sm text-on-surface-variant leading-relaxed"}>
{" Nhân viên bắt buộc gọi xác thực số điện thoại và thông báo chính sách: "}
                        <strong className={"text-on-surface"}>
{"\"Khách hàng có quyền mở hộp đồng kiểm ngoại quan, kiểm tra seal nguyên vẹn trước khi thanh toán tiền mặt 100% cho shipper\""}
                        </strong>
{". Đơn hàng chỉ bàn giao nhân viên giao vận sau khi khách nhấn nhận cuộc gọi xác thực. "}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={"xl:col-span-5 flex flex-col gap-6 sticky top-24"}>
                  <div className={"bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col"}>
                    <div className={"p-6 bg-surface-container-low/50 flex flex-col gap-3"}>
                      <div className={"flex items-center justify-between"}>
                        <div className={"flex items-center gap-2.5"}>
                          <span className={"font-headline-sm text-headline-sm font-semibold text-on-surface"}>
{"#SMAI-89240"}
                          </span>
                          <span className={"px-2.5 py-0.5 rounded-full bg-on-tertiary-container text-tertiary-container font-label-sm text-label-sm font-semibold"}>
{"Chờ xác nhận"}
                          </span>
                        </div>
                        <div className={"flex items-center gap-2"}>
                          <button className={"p-2 rounded-xl bg-surface-container hover:bg-surface-dim text-on-surface transition-colors"} title={"In phiếu giao nhận COD"} type="button">
                            <span className={"material-symbols-outlined text-[20px]"}>
{"print"}
                            </span>
                          </button>
                          <button className={"p-2 rounded-xl bg-surface-container hover:bg-surface-dim text-on-surface transition-colors"} title={"Ghi chú nội bộ"} type="button">
                            <span className={"material-symbols-outlined text-[20px]"}>
{"note_add"}
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className={"flex items-center justify-between font-caption text-caption text-on-surface-variant"}>
                        <span>
{"Thời gian đặt: 24/10/2025 - 10:45:18"}
                        </span>
                        <span className={"text-primary font-medium flex items-center gap-1"}>
                          <span className={"w-1.5 h-1.5 rounded-full bg-primary animate-pulse"}>

                          </span>
{" Kênh bán: Web AI Assistant "}
                        </span>
                      </div>
                    </div>
                    <div className={"p-6 flex flex-col gap-6"}>
                      <div className={"flex flex-col gap-3 p-4 rounded-xl bg-surface-container-low"}>
                        <div className={"flex items-center justify-between"}>
                          <div className={"flex items-center gap-2 text-on-surface font-semibold font-label-md text-label-md"}>
                            <span className={"material-symbols-outlined text-[20px] text-primary"}>
{"person_pin_circle"}
                            </span>
                            <span>
{"Thông tin khách hàng & Giao nhận"}
                            </span>
                          </div>
                          <a className={"inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm font-medium shadow-sm hover:opacity-95 transition-opacity"} href={"tel:0912345678"}>
                            <span className={"material-symbols-outlined text-[16px]"}>
{"call"}
                            </span>
                            <span>
{"Gọi ngay (0912 345 678)"}
                            </span>
                          </a>
                        </div>
                        <div className={"grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2"}>
                          <div className={"flex flex-col gap-0.5"}>
                            <span className={"font-caption text-caption text-outline"}>
{"Họ và tên khách:"}
                            </span>
                            <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"Nguyễn Minh Hoàng"}
                            </span>
                          </div>
                          <div className={"flex flex-col gap-0.5"}>
                            <span className={"font-caption text-caption text-outline"}>
{"Số điện thoại:"}
                            </span>
                            <span className={"font-body-md text-body-md font-medium text-secondary"}>
{"0912 345 678"}
                            </span>
                          </div>
                        </div>
                        <div className={"flex flex-col gap-0.5 pt-1"}>
                          <span className={"font-caption text-caption text-outline"}>
{"Địa chỉ nhận hàng COD:"}
                          </span>
                          <span className={"font-body-sm text-body-sm text-on-surface font-medium leading-snug"}>
{" Số 18 Ngõ 86 Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội "}
                          </span>
                        </div>
                        <div className={"p-3 rounded-lg bg-surface-container flex items-start gap-2.5 mt-1"}>
                          <span className={"material-symbols-outlined text-[18px] text-tertiary-container shrink-0 mt-0.5"}>
{"edit_note"}
                          </span>
                          <div className={"flex flex-col"}>
                            <span className={"font-caption text-caption text-tertiary-container font-semibold"}>
{"Ghi chú từ người nhận:"}
                            </span>
                            <p className={"font-body-sm text-body-sm text-on-surface italic"}>
{"\"Giao giờ hành chính, gọi trước khi đến 15 phút\""}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className={"flex flex-col gap-3"}>
                        <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"Sản phẩm đặt mua"}
                        </span>
                        <div className={"p-4 rounded-xl bg-surface-container-low flex items-center justify-between gap-4"}>
                          <div className={"flex items-center gap-3 min-w-0"}>
                            <img className={"w-14 h-14 rounded-xl object-cover bg-surface-container shrink-0"} data-alt={"iPhone 16 Pro Max Natural Titanium crisp luxury studio tech photo isolated on clean grey surface"} src={"/images/c3524a2adc442bc5.webp"} alt={"iPhone 16 Pro Max Natural Titanium crisp luxury studio tech photo isolated on clean grey surface"} />
                            <div className={"flex flex-col min-w-0"}>
                              <span className={"font-label-md text-label-md font-semibold text-on-surface truncate"}>
{"iPhone 16 Pro Max"}
                              </span>
                              <span className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"Phiên bản 256GB - Màu Titan Tự Nhiên"}
                              </span>
                              <span className={"font-caption text-caption text-outline"}>
{"Mã IMEI dự kiến: 358942-04-129481-9"}
                              </span>
                            </div>
                          </div>
                          <div className={"flex flex-col items-end shrink-0"}>
                            <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"34.990.000đ"}
                            </span>
                            <span className={"font-caption text-caption text-outline-variant font-medium"}>
{"SL: 01 máy"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={"p-4 rounded-xl bg-surface-container-low flex flex-col gap-2"}>
                        <div className={"flex items-center justify-between"}>
                          <div className={"flex items-center gap-2"}>
                            <span className={"material-symbols-outlined text-[18px] text-secondary"}>
{"payments"}
                            </span>
                            <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"Hình thức thanh toán"}
                            </span>
                          </div>
                          <span className={"px-2 py-0.5 rounded bg-primary-fixed text-primary font-caption text-caption font-semibold"}>
{"COD 100% Tiền mặt"}
                          </span>
                        </div>
                        <p className={"font-body-sm text-body-sm text-on-surface-variant leading-relaxed"}>
{" Thanh toán khi nhận hàng (COD 100%) - Khách được đồng kiểm, kiểm tra seal trước khi thanh toán. Shipper thu đúng giá trị niêm yết. "}
                        </p>
                        <div className={"flex items-center justify-between pt-2 border-t border-surface-container"}>
                          <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"Tổng tiền shipper cần thu:"}
                          </span>
                          <span className={"font-headline-sm text-headline-sm font-semibold text-primary"}>
{"34.990.000đ"}
                          </span>
                        </div>
                      </div>
                      <div className={"flex flex-col gap-3"}>
                        <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"Tiến trình xử lý đơn COD"}
                        </span>
                        <div className={"flex flex-col relative pl-6 space-y-5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container-highest"}>
                          <div className={"relative flex flex-col gap-1"}>
                            <div className={"absolute -left-[30px] top-0 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center"}>
                              <span className={"material-symbols-outlined text-[15px]"}>
{"check"}
                              </span>
                            </div>
                            <div className={"flex items-center justify-between"}>
                              <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"1. Khách đặt hàng trực tuyến"}
                              </span>
                              <span className={"font-caption text-caption text-outline"}>
{"10:45"}
                              </span>
                            </div>
                            <span className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"Khách xác nhận địa chỉ và chọn phương thức thanh toán tiền mặt"}
                            </span>
                          </div>
                          <div className={"relative flex flex-col gap-2"}>
                            <div className={"absolute -left-[30px] top-0 w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center animate-pulse"}>
                              <span className={"material-symbols-outlined text-[15px]"}>
{"ring_volume"}
                              </span>
                            </div>
                            <div className={"flex items-center justify-between"}>
                              <span className={"font-label-md text-label-md font-semibold text-secondary"}>
{"2. Xác nhận thông tin khách"}
                              </span>
                              <span className={"px-2 py-0.5 rounded-full bg-on-tertiary-container text-tertiary-container font-caption text-caption font-semibold"}>
{"Đang chờ cuộc gọi"}
                              </span>
                            </div>
                            <p className={"font-body-sm text-body-sm text-on-surface"}>
{"Chưa gọi xác nhận. Cần liên hệ ngay với anh Hoàng để chốt thời gian nhận hàng."}
                            </p>
                            <button className={"w-fit px-3.5 py-1.5 rounded-xl bg-secondary text-on-secondary font-label-sm text-label-sm font-medium shadow-sm hover:opacity-90 flex items-center gap-1.5 transition-all"} type="button">
                              <span className={"material-symbols-outlined text-[16px]"}>
{"check_circle"}
                              </span>
                              <span>
{"Xác nhận đơn ngay"}
                              </span>
                            </button>
                          </div>
                          <div className={"relative flex flex-col gap-1 opacity-60"}>
                            <div className={"absolute -left-[30px] top-0 w-6 h-6 rounded-full bg-surface-container text-outline flex items-center justify-center"}>
                              <span className={"material-symbols-outlined text-[15px]"}>
{"local_shipping"}
                              </span>
                            </div>
                            <div className={"flex items-center justify-between"}>
                              <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"3. Bàn giao shipper COD"}
                              </span>
                              <span className={"font-caption text-caption text-outline"}>
{"Sắp tới"}
                              </span>
                            </div>
                            <span className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"In phiếu giao COD, xuất kho kèm biên bản đồng kiểm nguyên seal"}
                            </span>
                          </div>
                          <div className={"relative flex flex-col gap-1 opacity-60"}>
                            <div className={"absolute -left-[30px] top-0 w-6 h-6 rounded-full bg-surface-container text-outline flex items-center justify-center"}>
                              <span className={"material-symbols-outlined text-[15px]"}>
{"paid"}
                              </span>
                            </div>
                            <div className={"flex items-center justify-between"}>
                              <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"4. Giao hàng thành công & Thu tiền"}
                              </span>
                              <span className={"font-caption text-caption text-outline"}>
{"Sắp tới"}
                              </span>
                            </div>
                            <span className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"Khách thanh toán 34.990.000đ tiền mặt và ký nhận seal máy"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={"pt-4 border-t border-surface-container flex flex-col gap-3"}>
                        <span className={"font-label-sm text-label-sm font-semibold uppercase tracking-wider text-outline"}>
{"Thao tác cập nhật trạng thái đơn"}
                        </span>
                        <div className={"grid grid-cols-2 gap-2.5"}>
                          <button className={"px-4 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-medium hover:bg-primary-container transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"} type="button">
                            <span className={"material-symbols-outlined text-[18px]"}>
{"verified"}
                            </span>
                            <span>
{"Xác nhận đơn hàng"}
                            </span>
                          </button>
                          <button className={"px-4 py-2.5 rounded-xl bg-secondary-fixed text-secondary font-label-md text-label-md font-medium hover:bg-secondary-fixed-dim transition-colors flex items-center justify-center gap-1.5 active:scale-95"} type="button">
                            <span className={"material-symbols-outlined text-[18px]"}>
{"moped"}
                            </span>
                            <span>
{"Bắt đầu giao"}
                            </span>
                          </button>
                          <button className={"px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md font-medium transition-colors flex items-center justify-center gap-1.5 active:scale-95"} type="button">
                            <span className={"material-symbols-outlined text-[18px]"}>
{"task_alt"}
                            </span>
                            <span>
{"Hoàn thành đơn"}
                            </span>
                          </button>
                          <button className={"px-4 py-2.5 rounded-xl bg-error-container hover:bg-red-200 text-error font-label-md text-label-md font-medium transition-colors flex items-center justify-center gap-1.5 active:scale-95"} type="button">
                            <span className={"material-symbols-outlined text-[18px]"}>
{"cancel"}
                            </span>
                            <span>
{"Hủy đơn hàng"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
