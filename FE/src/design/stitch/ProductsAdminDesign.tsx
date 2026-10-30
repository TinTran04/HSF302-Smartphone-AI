// Converted from qu_n_l_s_n_ph_m_smartphone_ai_admin/code.html. Read-only design reference.
// Inline scripts were replaced by React state in src/pages and src/features.
export default function ProductsAdminDesign() {
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
            <a aria-current={"page"} className={"flex items-center gap-3 px-3.5 py-2.5 transition-all bg-primary text-on-primary font-medium rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)]"} data-path={"quan-ly-san-pham"} href={"#"}>
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
            <div className={"relative w-full px-8 py-8 flex flex-col gap-8"}>
              <div className={"absolute -top-12 right-24 w-96 h-96 rounded-full bg-secondary-fixed/30 blur-3xl pointer-events-none -z-10"}>

              </div>
              <div className={"absolute top-48 left-1/3 w-80 h-80 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none -z-10"}>

              </div>
              <div className={"flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2"}>
                <div className={"flex flex-col gap-1.5"}>
                  <div className={"flex items-center gap-2"}>
                    <span className={"px-2.5 py-0.5 rounded-full bg-secondary-fixed font-caption text-caption text-secondary font-semibold uppercase tracking-wider"}>
{"Danh mục thiết bị"}
                    </span>
                    <span className={"w-1.5 h-1.5 rounded-full bg-outline-variant"}>

                    </span>
                    <span className={"font-caption text-caption text-on-surface-variant"}>
{"RAG Kiến thức cập nhật"}
                    </span>
                  </div>
                  <h1 className={"font-headline-lg text-headline-lg text-on-surface tracking-tight"}>
{"Quản lý sản phẩm"}
                  </h1>
                  <p className={"font-body-md text-body-md text-on-surface-variant max-w-2xl"}>
{" Danh sách thiết bị điện thoại kinh doanh, trạng thái hiển thị và cấu hình biến thể màu sắc, dung lượng phục vụ bộ máy AI tư vấn. "}
                  </p>
                </div>
                <div className={"flex items-center gap-3 shrink-0"}>
                  <button className={"group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm hover:bg-surface-container hover:shadow transition-all"} type={"button"}>
                    <span className={"material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-on-surface"}>
{"file_download"}
                    </span>
                    <span>
{"Xuất danh sách"}
                    </span>
                  </button>
                  <button className={"flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary-container hover:shadow-md transition-all"} type={"button"}>
                    <span className={"material-symbols-outlined text-[20px]"}>
{"add"}
                    </span>
                    <span>
{"Thêm sản phẩm mới"}
                    </span>
                  </button>
                </div>
              </div>
              <div className={"p-4 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4"}>
                <div className={"flex flex-1 items-center gap-3 bg-surface-container-low px-4 py-2.5 rounded-xl"}>
                  <span className={"material-symbols-outlined text-[20px] text-outline"}>
{"search"}
                  </span>
                  <input className={"w-full bg-transparent border-0 outline-none font-body-md text-body-md text-on-surface placeholder:text-outline"} placeholder={"Tìm theo tên máy, thương hiệu, chip xử lý..."} type={"text"} />
                  <span className={"font-caption text-caption px-2 py-0.5 rounded bg-surface-container font-medium text-outline"}>
{"⌘K"}
                  </span>
                </div>
                <div className={"flex flex-wrap items-center gap-3"}>
                  <div className={"relative min-w-[150px]"}>
                    <select className={"w-full appearance-none bg-surface-container-low hover:bg-surface-container px-3.5 py-2.5 pr-9 rounded-xl font-label-md text-label-md text-on-surface outline-none cursor-pointer transition-colors"}>
                      <option value={""}>
{"Thương hiệu: Tất cả"}
                      </option>
                      <option value={"apple"}>
{"Apple"}
                      </option>
                      <option value={"samsung"}>
{"Samsung"}
                      </option>
                      <option value={"xiaomi"}>
{"Xiaomi"}
                      </option>
                      <option value={"oppo"}>
{"OPPO"}
                      </option>
                      <option value={"vivo"}>
{"vivo"}
                      </option>
                    </select>
                    <span className={"material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-outline"}>
{"expand_more"}
                    </span>
                  </div>
                  <div className={"relative min-w-[170px]"}>
                    <select className={"w-full appearance-none bg-surface-container-low hover:bg-surface-container px-3.5 py-2.5 pr-9 rounded-xl font-label-md text-label-md text-on-surface outline-none cursor-pointer transition-colors"}>
                      <option value={""}>
{"Trạng thái: Tất cả"}
                      </option>
                      <option value={"active"}>
{"Đang kinh doanh"}
                      </option>
                      <option value={"hidden"}>
{"Đã ẩn"}
                      </option>
                    </select>
                    <span className={"material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-outline"}>
{"expand_more"}
                    </span>
                  </div>
                  <div className={"px-3.5 py-2 rounded-xl bg-secondary-fixed/50 flex items-center gap-2"}>
                    <span className={"w-2 h-2 rounded-full bg-secondary"}>

                    </span>
                    <span className={"font-label-sm text-label-sm text-secondary font-semibold"}>
{"Hiển thị 24 sản phẩm"}
                    </span>
                  </div>
                </div>
              </div>
              <div className={"grid grid-cols-1 xl:grid-cols-12 gap-8 items-start"}>
                <div className={"xl:col-span-8 flex flex-col gap-4"}>
                  <div className={"rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden"}>
                    <div className={"overflow-x-auto"}>
                      <table className={"w-full text-left border-collapse"}>
                        <thead>
                          <tr className={"bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant"}>
                            <th className={"py-3.5 px-4 font-medium"}>
{"Thiết bị"}
                            </th>
                            <th className={"py-3.5 px-4 font-medium"}>
{"Thương hiệu"}
                            </th>
                            <th className={"py-3.5 px-4 font-medium"}>
{"Giá khởi điểm"}
                            </th>
                            <th className={"py-3.5 px-4 font-medium"}>
{"Biến thể thiết lập"}
                            </th>
                            <th className={"py-3.5 px-4 font-medium"}>
{"Trạng thái"}
                            </th>
                            <th className={"py-3.5 px-4 font-medium text-right"}>
{"Thao tác"}
                            </th>
                          </tr>
                        </thead>
                        <tbody className={"divide-y divide-surface-container font-body-sm text-body-sm"}>
                          <tr className={"group hover:bg-surface-container-low/70 bg-secondary-fixed/10 transition-colors cursor-pointer"}>
                            <td className={"py-4 px-4"}>
                              <div className={"flex items-center gap-3.5"}>
                                <div className={"w-12 h-14 rounded-xl bg-surface-container flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-sm"}>
                                  <img className={"w-full h-full object-contain"} data-alt={"A pristine close-up photograph of an iPhone 16 Pro Max in Natural Titanium, premium architectural studio lighting, sleek reflections on aerospace titanium frame, ultra clean minimalist product photography with neutral high key background."} src={"/images/aa44bbf1dd1cc9ba.webp"} alt={"A pristine close-up photograph of an iPhone 16 Pro Max in Natural Titanium, premium architectural studio lighting, sleek reflections on aerospace titanium frame"} />
                                </div>
                                <div className={"flex flex-col min-w-0"}>
                                  <span className={"font-label-md text-label-md text-on-surface font-semibold truncate group-hover:text-primary transition-colors"}>
{"iPhone 16 Pro Max"}
                                  </span>
                                  <span className={"font-caption text-caption text-secondary font-medium"}>
{"Chip A18 Pro (3nm) • 6.9\" Super Retina"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className={"py-4 px-4 font-label-md text-label-md text-on-surface"}>
{"Apple"}
                            </td>
                            <td className={"py-4 px-4 font-label-md text-label-md font-semibold text-primary"}>
{"34.990.000₫"}
                            </td>
                            <td className={"py-4 px-4"}>
                              <button className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-fixed text-secondary font-label-sm text-label-sm font-medium hover:bg-secondary hover:text-on-secondary transition-all"} type={"button"}>
                                <span className={"material-symbols-outlined text-[15px]"}>
{"palette"}
                                </span>
                                <span>
{"4 màu • 3 dung lượng"}
                                </span>
                              </button>
                            </td>
                            <td className={"py-4 px-4"}>
                              <span className={"inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface font-medium"}>
                                <span className={"w-2 h-2 rounded-full bg-secondary-container"}>

                                </span>
{" Đang kinh doanh "}
                              </span>
                            </td>
                            <td className={"py-4 px-4 text-right"}>
                              <div className={"flex items-center justify-end gap-1"}>
                                <button className={"w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:bg-secondary-fixed transition-colors"} title={"Quản lý biến thể"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"tune"}
                                  </span>
                                </button>
                                <button className={"w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"} title={"Chỉnh sửa sản phẩm"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"edit"}
                                  </span>
                                </button>
                                <button className={"w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"} title={"Tạm ẩn"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"visibility"}
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr className={"group hover:bg-surface-container-low transition-colors cursor-pointer"}>
                            <td className={"py-4 px-4"}>
                              <div className={"flex items-center gap-3.5"}>
                                <div className={"w-12 h-14 rounded-xl bg-surface-container flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-sm"}>
                                  <img className={"w-full h-full object-contain"} data-alt={"A modern luxury photograph of Samsung Galaxy S24 Ultra in Titanium Gray with integrated S-Pen, refined industrial edges, ceramic glass aesthetic, premium studio lighting, soft diffuse shadow on light background."} src={"/images/fbc64043eb6e65d5.webp"} alt={"A modern luxury photograph of Samsung Galaxy S24 Ultra in Titanium Gray with integrated S-Pen, refined industrial edges, ceramic glass aesthetic, premium studio"} />
                                </div>
                                <div className={"flex flex-col min-w-0"}>
                                  <span className={"font-label-md text-label-md text-on-surface font-semibold truncate group-hover:text-primary transition-colors"}>
{"Samsung Galaxy S24 Ultra"}
                                  </span>
                                  <span className={"font-caption text-caption text-on-surface-variant"}>
{"Snapdragon 8 Gen 3 • Galaxy AI"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className={"py-4 px-4 font-label-md text-label-md text-on-surface"}>
{"Samsung"}
                            </td>
                            <td className={"py-4 px-4 font-label-md text-label-md font-semibold text-primary"}>
{"28.490.000₫"}
                            </td>
                            <td className={"py-4 px-4"}>
                              <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm font-medium"}>
                                <span className={"material-symbols-outlined text-[15px]"}>
{"style"}
                                </span>
                                <span>
{"4 màu • 2 dung lượng"}
                                </span>
                              </span>
                            </td>
                            <td className={"py-4 px-4"}>
                              <span className={"inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface font-medium"}>
                                <span className={"w-2 h-2 rounded-full bg-secondary-container"}>

                                </span>
{" Đang kinh doanh "}
                              </span>
                            </td>
                            <td className={"py-4 px-4 text-right"}>
                              <div className={"flex items-center justify-end gap-1"}>
                                <button className={"w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-secondary-fixed hover:text-secondary transition-colors"} title={"Quản lý biến thể"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"tune"}
                                  </span>
                                </button>
                                <button className={"w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"} title={"Chỉnh sửa sản phẩm"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"edit"}
                                  </span>
                                </button>
                                <button className={"w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"} title={"Tạm ẩn"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"visibility"}
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr className={"group hover:bg-surface-container-low transition-colors cursor-pointer"}>
                            <td className={"py-4 px-4"}>
                              <div className={"flex items-center gap-3.5"}>
                                <div className={"w-12 h-14 rounded-xl bg-surface-container flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-sm"}>
                                  <img className={"w-full h-full object-contain"} data-alt={"Refined commercial product shot of Xiaomi 14 Ultra with large circular Leica camera bump in white nano-tech vegan leather, architectural light gradients, premium minimalist presentation on neutral background."} src={"/images/b7d23046ece4b475.webp"} alt={"Refined commercial product shot of Xiaomi 14 Ultra with large circular Leica camera bump in white nano-tech vegan leather, architectural light gradients, premiu"} />
                                </div>
                                <div className={"flex flex-col min-w-0"}>
                                  <span className={"font-label-md text-label-md text-on-surface font-semibold truncate group-hover:text-primary transition-colors"}>
{"Xiaomi 14 Ultra"}
                                  </span>
                                  <span className={"font-caption text-caption text-on-surface-variant"}>
{"Snapdragon 8 Gen 3 • Leica Quad Cam"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className={"py-4 px-4 font-label-md text-label-md text-on-surface"}>
{"Xiaomi"}
                            </td>
                            <td className={"py-4 px-4 font-label-md text-label-md font-semibold text-primary"}>
{"25.990.000₫"}
                            </td>
                            <td className={"py-4 px-4"}>
                              <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm font-medium"}>
                                <span className={"material-symbols-outlined text-[15px]"}>
{"style"}
                                </span>
                                <span>
{"2 màu • 2 dung lượng"}
                                </span>
                              </span>
                            </td>
                            <td className={"py-4 px-4"}>
                              <span className={"inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface font-medium"}>
                                <span className={"w-2 h-2 rounded-full bg-secondary-container"}>

                                </span>
{" Đang kinh doanh "}
                              </span>
                            </td>
                            <td className={"py-4 px-4 text-right"}>
                              <div className={"flex items-center justify-end gap-1"}>
                                <button className={"w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-secondary-fixed hover:text-secondary transition-colors"} title={"Quản lý biến thể"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"tune"}
                                  </span>
                                </button>
                                <button className={"w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"} title={"Chỉnh sửa sản phẩm"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"edit"}
                                  </span>
                                </button>
                                <button className={"w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"} title={"Tạm ẩn"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"visibility"}
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr className={"group hover:bg-surface-container-low transition-colors cursor-pointer"}>
                            <td className={"py-4 px-4"}>
                              <div className={"flex items-center gap-3.5"}>
                                <div className={"w-12 h-14 rounded-xl bg-surface-container flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-sm"}>
                                  <img className={"w-full h-full object-contain"} data-alt={"High-end editorial studio rendering of OPPO Find X7 Ultra dual-tone leather and glass back, precision Hasselblad branding, smooth diffuse highlights, neutral pristine studio space."} src={"/images/9ff23063e1e8fd66.webp"} alt={"High-end editorial studio rendering of OPPO Find X7 Ultra dual-tone leather and glass back, precision Hasselblad branding, smooth diffuse highlights, neutral pr"} />
                                </div>
                                <div className={"flex flex-col min-w-0"}>
                                  <span className={"font-label-md text-label-md text-on-surface font-semibold truncate group-hover:text-primary transition-colors"}>
{"OPPO Find X7 Ultra"}
                                  </span>
                                  <span className={"font-caption text-caption text-on-surface-variant"}>
{"Snapdragon 8 Gen 3 • Dual Periscope"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className={"py-4 px-4 font-label-md text-label-md text-on-surface"}>
{"OPPO"}
                            </td>
                            <td className={"py-4 px-4 font-label-md text-label-md font-semibold text-primary"}>
{"21.990.000₫"}
                            </td>
                            <td className={"py-4 px-4"}>
                              <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm font-medium"}>
                                <span className={"material-symbols-outlined text-[15px]"}>
{"style"}
                                </span>
                                <span>
{"3 màu • 2 dung lượng"}
                                </span>
                              </span>
                            </td>
                            <td className={"py-4 px-4"}>
                              <span className={"inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface font-medium"}>
                                <span className={"w-2 h-2 rounded-full bg-secondary-container"}>

                                </span>
{" Đang kinh doanh "}
                              </span>
                            </td>
                            <td className={"py-4 px-4 text-right"}>
                              <div className={"flex items-center justify-end gap-1"}>
                                <button className={"w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-secondary-fixed hover:text-secondary transition-colors"} title={"Quản lý biến thể"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"tune"}
                                  </span>
                                </button>
                                <button className={"w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"} title={"Chỉnh sửa sản phẩm"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"edit"}
                                  </span>
                                </button>
                                <button className={"w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"} title={"Tạm ẩn"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"visibility"}
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr className={"group hover:bg-surface-container-low transition-colors cursor-pointer"}>
                            <td className={"py-4 px-4"}>
                              <div className={"flex items-center gap-3.5"}>
                                <div className={"w-12 h-14 rounded-xl bg-surface-container flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-sm"}>
                                  <img className={"w-full h-full object-contain"} data-alt={"Studio product photograph of vivo X100 Pro in Sunset Orange ripple glass texture with ZEISS blue insignia on large camera module, exquisite luxury consumer hardware look, light gray backdrop."} src={"/images/4b2a0e524a251c53.webp"} alt={"Studio product photograph of vivo X100 Pro in Sunset Orange ripple glass texture with ZEISS blue insignia on large camera module, exquisite luxury consumer hard"} />
                                </div>
                                <div className={"flex flex-col min-w-0"}>
                                  <span className={"font-label-md text-label-md text-on-surface font-semibold truncate group-hover:text-primary transition-colors"}>
{"vivo X100 Pro"}
                                  </span>
                                  <span className={"font-caption text-caption text-on-surface-variant"}>
{"Dimensity 9300 • ZEISS V3 ISP"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className={"py-4 px-4 font-label-md text-label-md text-on-surface"}>
{"vivo"}
                            </td>
                            <td className={"py-4 px-4 font-label-md text-label-md font-semibold text-primary"}>
{"19.990.000₫"}
                            </td>
                            <td className={"py-4 px-4"}>
                              <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm font-medium"}>
                                <span className={"material-symbols-outlined text-[15px]"}>
{"style"}
                                </span>
                                <span>
{"2 màu • 1 dung lượng"}
                                </span>
                              </span>
                            </td>
                            <td className={"py-4 px-4"}>
                              <span className={"inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface font-medium"}>
                                <span className={"w-2 h-2 rounded-full bg-secondary-container"}>

                                </span>
{" Đang kinh doanh "}
                              </span>
                            </td>
                            <td className={"py-4 px-4 text-right"}>
                              <div className={"flex items-center justify-end gap-1"}>
                                <button className={"w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-secondary-fixed hover:text-secondary transition-colors"} title={"Quản lý biến thể"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"tune"}
                                  </span>
                                </button>
                                <button className={"w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"} title={"Chỉnh sửa sản phẩm"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"edit"}
                                  </span>
                                </button>
                                <button className={"w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"} title={"Tạm ẩn"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"visibility"}
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr className={"group hover:bg-surface-container-low transition-colors opacity-75 hover:opacity-100 cursor-pointer"}>
                            <td className={"py-4 px-4"}>
                              <div className={"flex items-center gap-3.5"}>
                                <div className={"w-12 h-14 rounded-xl bg-surface-container-low flex items-center justify-center p-1 overflow-hidden shrink-0 grayscale group-hover:grayscale-0 transition-all shadow-sm"}>
                                  <img className={"w-full h-full object-contain"} data-alt={"Minimalist studio product shot of iPhone 15 Pro Max in Blue Titanium, brushed metallic texture, side profile highlighting the aerospace titanium frame, soft diffused lighting, neutral off-white background."} src={"/images/cee3e1d98f9f4404.webp"} alt={"Minimalist studio product shot of iPhone 15 Pro Max in Blue Titanium, brushed metallic texture, side profile highlighting the aerospace titanium frame, soft dif"} />
                                </div>
                                <div className={"flex flex-col min-w-0"}>
                                  <span className={"font-label-md text-label-md text-on-surface font-semibold truncate"}>
{"iPhone 15 Pro Max"}
                                  </span>
                                  <span className={"font-caption text-caption text-on-surface-variant"}>
{"Chip A17 Pro (3nm) • 6.7\" OLED"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className={"py-4 px-4 font-label-md text-label-md text-on-surface"}>
{"Apple"}
                            </td>
                            <td className={"py-4 px-4 font-label-md text-label-md font-semibold text-on-surface-variant"}>
{"27.990.000₫"}
                            </td>
                            <td className={"py-4 px-4"}>
                              <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm font-medium"}>
                                <span className={"material-symbols-outlined text-[15px]"}>
{"style"}
                                </span>
                                <span>
{"4 màu • 3 dung lượng"}
                                </span>
                              </span>
                            </td>
                            <td className={"py-4 px-4"}>
                              <span className={"inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high font-label-sm text-label-sm text-outline font-medium"}>
                                <span className={"w-2 h-2 rounded-full bg-outline"}>

                                </span>
{" Tạm ẩn "}
                              </span>
                            </td>
                            <td className={"py-4 px-4 text-right"}>
                              <div className={"flex items-center justify-end gap-1"}>
                                <button className={"w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-secondary-fixed hover:text-secondary transition-colors"} title={"Quản lý biến thể"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"tune"}
                                  </span>
                                </button>
                                <button className={"w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"} title={"Chỉnh sửa sản phẩm"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"edit"}
                                  </span>
                                </button>
                                <button className={"w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:bg-secondary-fixed transition-colors"} title={"Kích hoạt lại"} type="button">
                                  <span className={"material-symbols-outlined text-[18px]"}>
{"visibility_off"}
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className={"px-6 py-4 bg-surface-container-lowest flex items-center justify-between border-t border-surface-container"}>
                      <span className={"font-caption text-caption text-on-surface-variant"}>
{"Trang 1 / 4 (Tổng cộng 24 điện thoại thông minh)"}
                      </span>
                      <div className={"flex items-center gap-1.5"}>
                        <button className={"w-8 h-8 rounded-lg flex items-center justify-center text-outline cursor-not-allowed"} disabled={true} type="button">
                          <span className={"material-symbols-outlined text-[18px]"}>
{"chevron_left"}
                          </span>
                        </button>
                        <button className={"w-8 h-8 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center justify-center shadow-sm"} type="button">
{"1"}
                        </button>
                        <button className={"w-8 h-8 rounded-lg hover:bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center justify-center transition-colors"} type="button">
{"2"}
                        </button>
                        <button className={"w-8 h-8 rounded-lg hover:bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center justify-center transition-colors"} type="button">
{"3"}
                        </button>
                        <button className={"w-8 h-8 rounded-lg hover:bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center justify-center transition-colors"} type="button">
{"4"}
                        </button>
                        <button className={"w-8 h-8 rounded-lg flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"} type="button">
                          <span className={"material-symbols-outlined text-[18px]"}>
{"chevron_right"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className={"p-4 rounded-xl bg-surface-container-low flex items-start gap-3.5"}>
                    <div className={"w-7 h-7 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary shrink-0 mt-0.5"}>
                      <span className={"material-symbols-outlined text-[16px]"}>
{"info"}
                      </span>
                    </div>
                    <div className={"flex flex-col gap-0.5"}>
                      <span className={"font-label-sm text-label-sm text-on-surface font-semibold"}>
{"Quy chuẩn dữ liệu danh mục & AI Recommendation:"}
                      </span>
                      <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
{" Hệ thống quản trị chỉ tập trung cấu hình thuộc tính kỹ thuật, danh sách phối màu và bảng giá niêm yết theo phiên bản. Toàn bộ thông tin không phân bổ số lượng tồn kho hay kiểm kê kho bãi theo đúng kiến trúc sàn bán lẻ thông minh. "}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={"xl:col-span-4 flex flex-col gap-6"}>
                  <div className={"rounded-2xl bg-surface-container-lowest p-6 shadow-sm flex flex-col gap-6 relative overflow-hidden"}>
                    <div className={"flex items-center justify-between"}>
                      <div className={"flex items-center gap-2"}>
                        <span className={"w-7 h-7 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary"}>
                          <span className={"material-symbols-outlined text-[18px]"}>
{"tune"}
                          </span>
                        </span>
                        <div className={"flex flex-col"}>
                          <span className={"font-label-md text-label-md text-on-surface font-semibold"}>
{"Cấu hình biến thể"}
                          </span>
                          <span className={"font-caption text-caption text-secondary font-medium"}>
{"Đang hiệu chỉnh trực tiếp"}
                          </span>
                        </div>
                      </div>
                      <span className={"px-2.5 py-1 rounded-full bg-surface-container font-caption text-caption text-on-surface font-semibold"}>
{"4 Màu • 3 Dung lượng"}
                      </span>
                    </div>
                    <div className={"p-4 rounded-xl bg-surface-container-low flex items-center gap-4"}>
                      <div className={"w-14 h-16 rounded-lg bg-surface-container-lowest p-1.5 flex items-center justify-center shrink-0 shadow-sm"}>
                        <img className={"w-full h-full object-contain"} data-alt={"High resolution rendering of the natural titanium back panel of an iPhone 16 Pro Max with metallic lens rings, pristine and photorealistic luxury tech design."} id={"previewImage"} src={"/images/a20a3e0428163c01.webp"} alt={"High resolution rendering of the natural titanium back panel of an iPhone 16 Pro Max with metallic lens rings, pristine and photorealistic luxury tech design."} />
                      </div>
                      <div className={"flex flex-col min-w-0 flex-1"}>
                        <span className={"font-headline-sm text-label-md text-on-surface font-semibold truncate"} id={"previewTitle"}>
{"iPhone 16 Pro Max"}
                        </span>
                        <span className={"font-caption text-caption text-secondary font-medium"} id={"previewChip"}>
{"Apple A18 Pro (3nm)"}
                        </span>
                        <span className={"font-body-sm text-body-sm text-on-surface-variant"} id={"previewBrand"}>
{"Thương hiệu: Apple"}
                        </span>
                      </div>
                    </div>
                    <div className={"flex flex-col gap-3"}>
                      <div className={"flex items-center justify-between"}>
                        <label className={"font-label-sm text-label-sm text-on-surface font-semibold uppercase tracking-wider"}>
{"1. Phối màu phần cứng (4 Màu)"}
                        </label>
                        <button className={"font-caption text-caption text-secondary font-semibold hover:underline flex items-center gap-1"} type={"button"}>
                          <span className={"material-symbols-outlined text-[14px]"}>
{"add_circle"}
                          </span>
{" Thêm màu "}
                        </button>
                      </div>
                      <div className={"grid grid-cols-2 gap-2.5"}>
                        <div className={"p-2.5 rounded-xl bg-surface-container-low flex items-center justify-between group hover:bg-surface-container transition-colors"}>
                          <div className={"flex items-center gap-2 min-w-0"}>
                            <span className={"w-4 h-4 rounded-full bg-[#B8AFA6] shadow-sm shrink-0"}>

                            </span>
                            <span className={"font-label-sm text-label-sm text-on-surface truncate"}>
{"Titan Tự Nhiên"}
                            </span>
                          </div>
                          <span className={"material-symbols-outlined text-[16px] text-outline group-hover:text-on-surface cursor-pointer"}>
{"close"}
                          </span>
                        </div>
                        <div className={"p-2.5 rounded-xl bg-surface-container-low flex items-center justify-between group hover:bg-surface-container transition-colors"}>
                          <div className={"flex items-center gap-2 min-w-0"}>
                            <span className={"w-4 h-4 rounded-full bg-[#C9B8A0] shadow-sm shrink-0"}>

                            </span>
                            <span className={"font-label-sm text-label-sm text-on-surface truncate"}>
{"Titan Sa Mạc"}
                            </span>
                          </div>
                          <span className={"material-symbols-outlined text-[16px] text-outline group-hover:text-on-surface cursor-pointer"}>
{"close"}
                          </span>
                        </div>
                        <div className={"p-2.5 rounded-xl bg-surface-container-low flex items-center justify-between group hover:bg-surface-container transition-colors"}>
                          <div className={"flex items-center gap-2 min-w-0"}>
                            <span className={"w-4 h-4 rounded-full bg-[#E5E5E7] shadow-sm shrink-0"}>

                            </span>
                            <span className={"font-label-sm text-label-sm text-on-surface truncate"}>
{"Titan Trắng"}
                            </span>
                          </div>
                          <span className={"material-symbols-outlined text-[16px] text-outline group-hover:text-on-surface cursor-pointer"}>
{"close"}
                          </span>
                        </div>
                        <div className={"p-2.5 rounded-xl bg-surface-container-low flex items-center justify-between group hover:bg-surface-container transition-colors"}>
                          <div className={"flex items-center gap-2 min-w-0"}>
                            <span className={"w-4 h-4 rounded-full bg-[#39383B] shadow-sm shrink-0"}>

                            </span>
                            <span className={"font-label-sm text-label-sm text-on-surface truncate"}>
{"Titan Đen"}
                            </span>
                          </div>
                          <span className={"material-symbols-outlined text-[16px] text-outline group-hover:text-on-surface cursor-pointer"}>
{"close"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={"flex flex-col gap-3"}>
                      <div className={"flex items-center justify-between"}>
                        <label className={"font-label-sm text-label-sm text-on-surface font-semibold uppercase tracking-wider"}>
{"2. Ma trận dung lượng & Bảng giá"}
                        </label>
                        <button className={"font-caption text-caption text-secondary font-semibold hover:underline flex items-center gap-1"} type={"button"}>
                          <span className={"material-symbols-outlined text-[14px]"}>
{"add_circle"}
                          </span>
{" Thêm mức bộ nhớ "}
                        </button>
                      </div>
                      <div className={"flex flex-col gap-2.5"}>
                        <div className={"p-3.5 rounded-xl bg-surface-container-low flex items-center justify-between"}>
                          <div className={"flex items-center gap-3"}>
                            <div className={"w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center font-label-md text-label-md font-semibold text-on-surface shadow-sm"}>
{" 256G "}
                            </div>
                            <div className={"flex flex-col"}>
                              <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"Phiên bản 256GB"}
                              </span>
                              <span className={"font-caption text-caption text-on-surface-variant"}>
{"Tiêu chuẩn flagship"}
                              </span>
                            </div>
                          </div>
                          <div className={"flex items-center gap-2"}>
                            <div className={"relative"}>
                              <input className={"w-32 bg-surface-container-lowest px-3 py-1.5 rounded-lg text-right font-label-md text-label-md font-semibold text-primary outline-none shadow-sm focus:ring-1 focus:ring-primary"} type={"text"} defaultValue={"34.990.000"} />
                              <span className={"absolute right-2 top-1/2 -translate-y-1/2 font-caption text-caption text-on-surface-variant pointer-events-none"}>
{"₫"}
                              </span>
                            </div>
                            <button className={"w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-error-container transition-colors"} type={"button"}>
                              <span className={"material-symbols-outlined text-[16px]"}>
{"delete"}
                              </span>
                            </button>
                          </div>
                        </div>
                        <div className={"p-3.5 rounded-xl bg-surface-container-low flex items-center justify-between"}>
                          <div className={"flex items-center gap-3"}>
                            <div className={"w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center font-label-md text-label-md font-semibold text-on-surface shadow-sm"}>
{" 512G "}
                            </div>
                            <div className={"flex flex-col"}>
                              <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"Phiên bản 512GB"}
                              </span>
                              <span className={"font-caption text-caption text-secondary font-medium"}>
{"Bán chạy nhất"}
                              </span>
                            </div>
                          </div>
                          <div className={"flex items-center gap-2"}>
                            <div className={"relative"}>
                              <input className={"w-32 bg-surface-container-lowest px-3 py-1.5 rounded-lg text-right font-label-md text-label-md font-semibold text-primary outline-none shadow-sm focus:ring-1 focus:ring-primary"} type={"text"} defaultValue={"39.990.000"} />
                              <span className={"absolute right-2 top-1/2 -translate-y-1/2 font-caption text-caption text-on-surface-variant pointer-events-none"}>
{"₫"}
                              </span>
                            </div>
                            <button className={"w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-error-container transition-colors"} type={"button"}>
                              <span className={"material-symbols-outlined text-[16px]"}>
{"delete"}
                              </span>
                            </button>
                          </div>
                        </div>
                        <div className={"p-3.5 rounded-xl bg-surface-container-low flex items-center justify-between"}>
                          <div className={"flex items-center gap-3"}>
                            <div className={"w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center font-label-md text-label-md font-semibold text-on-surface shadow-sm"}>
{" 1TB "}
                            </div>
                            <div className={"flex flex-col"}>
                              <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"Phiên bản 1TB"}
                              </span>
                              <span className={"font-caption text-caption text-on-surface-variant"}>
{"Dung lượng cực đại"}
                              </span>
                            </div>
                          </div>
                          <div className={"flex items-center gap-2"}>
                            <div className={"relative"}>
                              <input className={"w-32 bg-surface-container-lowest px-3 py-1.5 rounded-lg text-right font-label-md text-label-md font-semibold text-primary outline-none shadow-sm focus:ring-1 focus:ring-primary"} type={"text"} defaultValue={"45.990.000"} />
                              <span className={"absolute right-2 top-1/2 -translate-y-1/2 font-caption text-caption text-on-surface-variant pointer-events-none"}>
{"₫"}
                              </span>
                            </div>
                            <button className={"w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-error-container transition-colors"} type={"button"}>
                              <span className={"material-symbols-outlined text-[16px]"}>
{"delete"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={"p-4 rounded-xl bg-secondary-fixed/30 flex flex-col gap-2.5"}>
                      <div className={"flex items-center gap-2 text-secondary"}>
                        <span className={"material-symbols-outlined text-[18px]"}>
{"auto_awesome"}
                        </span>
                        <span className={"font-label-sm text-label-sm font-semibold"}>
{"Đồng bộ tự động vào AI Assistant"}
                        </span>
                      </div>
                      <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
{" Khi lưu thay đổi, bảng giá 3 biến thể và 4 mã màu sẽ cập nhật tức thời cho mô hình tư vấn, chatbot so sánh thông số và công cụ định giá COD của khách hàng. "}
                      </p>
                    </div>
                    <div className={"flex items-center justify-end gap-3 pt-2"}>
                      <button className={"px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors"} type={"button"}>
{" Hủy bỏ "}
                      </button>
                      <button className={"flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container shadow-sm transition-all flex items-center justify-center gap-2"} type={"button"}>
                        <span className={"material-symbols-outlined text-[18px]"}>
{"save"}
                        </span>
                        <span>
{"Lưu bảng biến thể"}
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className={"rounded-2xl bg-surface-container-lowest p-5 shadow-sm flex items-center justify-between"}>
                    <div className={"flex items-center gap-3"}>
                      <div className={"w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary"}>
                        <span className={"material-symbols-outlined text-[22px]"}>
{"batch_prediction"}
                        </span>
                      </div>
                      <div className={"flex flex-col"}>
                        <span className={"font-label-md text-label-md text-on-surface font-semibold"}>
{"Kiểm tra tính nhất quán giá"}
                        </span>
                        <span className={"font-caption text-caption text-on-surface-variant"}>
{"24/24 thiết bị khớp thông số RAG"}
                        </span>
                      </div>
                    </div>
                    <button className={"px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm font-medium transition-colors"} type={"button"}>
{" Quét lại "}
                    </button>
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
