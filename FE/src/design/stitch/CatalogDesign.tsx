// Converted from danh_m_c_i_n_tho_i_smartphone_ai/code.html. Read-only design reference.
// Inline scripts were replaced by React state in src/pages and src/features.
export default function CatalogDesign() {
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
          <div className={"max-w-[1240px] w-full mx-auto px-gutter py-space-xl"}>
            <div className={"flex flex-col gap-space-sm mb-space-lg"}>
              <nav aria-label={"Đường dẫn trang"} className={"flex items-center gap-2 font-caption text-caption text-on-surface-variant"}>
                <a className={"hover:text-primary transition-colors flex items-center gap-1"} href={"#"}>
                  <span className={"material-symbols-outlined text-[14px]"}>
{"home"}
                  </span>
{" Trang chủ "}
                </a>
                <span className={"text-outline-variant"}>
{"/"}
                </span>
                <span className={"text-on-surface font-medium"}>
{"Điện thoại"}
                </span>
              </nav>
              <div className={"flex flex-col md:flex-row md:items-end justify-between gap-space-md"}>
                <div>
                  <div className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold mb-2"}>
                    <span className={"material-symbols-outlined text-[14px]"}>
{"auto_awesome"}
                    </span>
{" BỘ SƯU TẬP SMARTPHONE CHÍNH HÃNG "}
                  </div>
                  <h1 className={"font-headline-lg text-headline-lg text-on-surface tracking-tight"}>
{"Khám phá điện thoại"}
                  </h1>
                  <p className={"font-body-md text-body-md text-on-surface-variant mt-1"}>
{"Tìm kiếm các dòng smartphone chính hãng mới nhất tích hợp AI thế hệ mới."}
                  </p>
                </div>
                <div className={"flex items-center gap-space-md self-start md:self-auto"}>
                  <span className={"font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap"}>
{"Hiển thị "}
                    <span className={"font-semibold text-on-surface"}>
{"24"}
                    </span>
{" sản phẩm"}
                  </span>
                  <div className={"relative inline-block text-left"} id={"sort-dropdown-wrapper"}>
                    <button className={"inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors shadow-sm"} id={"sort-button"} type={"button"}>
                      <span className={"text-on-surface-variant font-normal"}>
{"Sắp xếp:"}
                      </span>
                      <span className={"font-semibold"} id={"current-sort"}>
{"Nổi bật nhất"}
                      </span>
                      <span className={"material-symbols-outlined text-[18px] text-outline"}>
{"expand_more"}
                      </span>
                    </button>
                    <div className={"hidden absolute right-0 mt-2 w-52 rounded-xl bg-surface-container-lowest shadow-xl p-1.5 z-30"} id={"sort-menu"}>
                      <button className={"w-full text-left px-3 py-2 rounded-lg font-body-sm text-body-sm text-primary bg-primary-fixed/30 font-medium flex items-center justify-between"} type="button">
{" Nổi bật nhất "}
                        <span className={"material-symbols-outlined text-[16px]"}>
{"check"}
                        </span>
                      </button>
                      <button className={"w-full text-left px-3 py-2 rounded-lg font-body-sm text-body-sm text-on-surface hover:bg-surface-container transition-colors"} type="button">
{"Mới nhất"}
                      </button>
                      <button className={"w-full text-left px-3 py-2 rounded-lg font-body-sm text-body-sm text-on-surface hover:bg-surface-container transition-colors"} type="button">
{"Giá tăng dần"}
                      </button>
                      <button className={"w-full text-left px-3 py-2 rounded-lg font-body-sm text-body-sm text-on-surface hover:bg-surface-container transition-colors"} type="button">
{"Giá giảm dần"}
                      </button>
                      <button className={"w-full text-left px-3 py-2 rounded-lg font-body-sm text-body-sm text-on-surface hover:bg-surface-container transition-colors"} type="button">
{"Đánh giá cao"}
                      </button>
                    </div>
                  </div>
                  <div className={"flex items-center bg-surface-container p-0.5 rounded-xl"}>
                    <button className={"p-1.5 rounded-lg bg-surface-container-lowest text-primary shadow-sm"} title={"Chế độ lưới"} type={"button"}>
                      <span className={"material-symbols-outlined text-[20px]"}>
{"grid_view"}
                      </span>
                    </button>
                    <button className={"p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"} title={"Chế độ danh sách"} type={"button"}>
                      <span className={"material-symbols-outlined text-[20px]"}>
{"view_list"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className={"flex flex-wrap items-center gap-2 mb-space-lg p-3 rounded-xl bg-surface-container-low shadow-sm"}>
              <span className={"font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5"}>
                <span className={"material-symbols-outlined text-[16px] text-primary"}>
{"filter_alt"}
                </span>
{" Bộ lọc đang chọn: "}
              </span>
              <span className={"inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface font-label-sm text-label-sm shadow-sm group"}>
{" Thương hiệu: Apple "}
                <button aria-label={"Bỏ lọc Apple"} className={"text-outline hover:text-error transition-colors flex items-center"} type="button">
                  <span className={"material-symbols-outlined text-[14px]"}>
{"close"}
                  </span>
                </button>
              </span>
              <span className={"inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface font-label-sm text-label-sm shadow-sm group"}>
{" Khoảng giá: 20 - 30 triệu "}
                <button aria-label={"Bỏ lọc khoảng giá"} className={"text-outline hover:text-error transition-colors flex items-center"} type="button">
                  <span className={"material-symbols-outlined text-[14px]"}>
{"close"}
                  </span>
                </button>
              </span>
              <span className={"inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface font-label-sm text-label-sm shadow-sm group"}>
{" RAM: 12GB trở lên "}
                <button aria-label={"Bỏ lọc RAM"} className={"text-outline hover:text-error transition-colors flex items-center"} type="button">
                  <span className={"material-symbols-outlined text-[14px]"}>
{"close"}
                  </span>
                </button>
              </span>
              <button className={"ml-auto font-label-sm text-label-sm text-secondary hover:underline flex items-center gap-1"} type="button">
                <span className={"material-symbols-outlined text-[14px]"}>
{"restart_alt"}
                </span>
{" Xóa tất cả "}
              </button>
            </div>
            <div className={"grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start"}>
              <aside className={"lg:col-span-3 flex flex-col gap-space-md"}>
                <div className={"bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md"}>
                  <div className={"flex items-center justify-between pb-space-xs"}>
                    <div className={"flex items-center gap-2"}>
                      <span className={"material-symbols-outlined text-primary text-[20px]"}>
{"tune"}
                      </span>
                      <h2 className={"font-headline-sm text-headline-sm text-on-surface"}>
{"Bộ lọc tìm kiếm"}
                      </h2>
                    </div>
                    <a className={"font-caption text-caption text-outline hover:text-primary transition-colors"} href={"#"}>
{"Thiết lập lại"}
                    </a>
                  </div>
                  <div className={"flex flex-col gap-space-xs pt-space-xs"}>
                    <h3 className={"font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between"}>
{" Thương hiệu "}
                      <span className={"material-symbols-outlined text-[18px] text-outline"}>
{"expand_less"}
                      </span>
                    </h3>
                    <div className={"flex flex-col gap-2 mt-1"}>
                      <label className={"flex items-center justify-between cursor-pointer group py-1"}>
                        <div className={"flex items-center gap-2.5"}>
                          <input defaultChecked={true} className={"w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"} type={"checkbox"} />
                          <span className={"font-body-sm text-body-sm text-on-surface group-hover:text-primary transition-colors font-medium"}>
{"Apple"}
                          </span>
                        </div>
                        <span className={"font-caption text-caption text-outline px-2 py-0.5 rounded-full bg-surface-container"}>
{"8"}
                        </span>
                      </label>
                      <label className={"flex items-center justify-between cursor-pointer group py-1"}>
                        <div className={"flex items-center gap-2.5"}>
                          <input className={"w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"} type={"checkbox"} />
                          <span className={"font-body-sm text-body-sm text-on-surface group-hover:text-primary transition-colors"}>
{"Samsung"}
                          </span>
                        </div>
                        <span className={"font-caption text-caption text-outline px-2 py-0.5 rounded-full bg-surface-container"}>
{"6"}
                        </span>
                      </label>
                      <label className={"flex items-center justify-between cursor-pointer group py-1"}>
                        <div className={"flex items-center gap-2.5"}>
                          <input className={"w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"} type={"checkbox"} />
                          <span className={"font-body-sm text-body-sm text-on-surface group-hover:text-primary transition-colors"}>
{"Xiaomi"}
                          </span>
                        </div>
                        <span className={"font-caption text-caption text-outline px-2 py-0.5 rounded-full bg-surface-container"}>
{"5"}
                        </span>
                      </label>
                      <label className={"flex items-center justify-between cursor-pointer group py-1"}>
                        <div className={"flex items-center gap-2.5"}>
                          <input className={"w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"} type={"checkbox"} />
                          <span className={"font-body-sm text-body-sm text-on-surface group-hover:text-primary transition-colors"}>
{"OPPO"}
                          </span>
                        </div>
                        <span className={"font-caption text-caption text-outline px-2 py-0.5 rounded-full bg-surface-container"}>
{"3"}
                        </span>
                      </label>
                      <label className={"flex items-center justify-between cursor-pointer group py-1"}>
                        <div className={"flex items-center gap-2.5"}>
                          <input className={"w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"} type={"checkbox"} />
                          <span className={"font-body-sm text-body-sm text-on-surface group-hover:text-primary transition-colors"}>
{"vivo"}
                          </span>
                        </div>
                        <span className={"font-caption text-caption text-outline px-2 py-0.5 rounded-full bg-surface-container"}>
{"2"}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className={"flex flex-col gap-space-xs pt-space-xs"}>
                    <h3 className={"font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between"}>
{" Khoảng giá "}
                      <span className={"material-symbols-outlined text-[18px] text-outline"}>
{"expand_less"}
                      </span>
                    </h3>
                    <div className={"flex flex-col gap-1.5 mt-1"}>
                      <label className={"flex items-center gap-2.5 cursor-pointer py-1"}>
                        <input className={"w-4 h-4 accent-primary text-primary cursor-pointer"} name={"price_range"} type={"radio"} />
                        <span className={"font-body-sm text-body-sm text-on-surface"}>
{"Dưới 10 triệu"}
                        </span>
                      </label>
                      <label className={"flex items-center gap-2.5 cursor-pointer py-1"}>
                        <input className={"w-4 h-4 accent-primary text-primary cursor-pointer"} name={"price_range"} type={"radio"} />
                        <span className={"font-body-sm text-body-sm text-on-surface"}>
{"10 - 15 triệu"}
                        </span>
                      </label>
                      <label className={"flex items-center gap-2.5 cursor-pointer py-1"}>
                        <input className={"w-4 h-4 accent-primary text-primary cursor-pointer"} name={"price_range"} type={"radio"} />
                        <span className={"font-body-sm text-body-sm text-on-surface"}>
{"15 - 20 triệu"}
                        </span>
                      </label>
                      <label className={"flex items-center gap-2.5 cursor-pointer py-1"}>
                        <input defaultChecked={true} className={"w-4 h-4 accent-primary text-primary cursor-pointer"} name={"price_range"} type={"radio"} />
                        <span className={"font-body-sm text-body-sm text-primary font-semibold"}>
{"20 - 30 triệu"}
                        </span>
                      </label>
                      <label className={"flex items-center gap-2.5 cursor-pointer py-1"}>
                        <input className={"w-4 h-4 accent-primary text-primary cursor-pointer"} name={"price_range"} type={"radio"} />
                        <span className={"font-body-sm text-body-sm text-on-surface"}>
{"Trên 30 triệu"}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className={"flex flex-col gap-space-xs pt-space-xs"}>
                    <h3 className={"font-label-md text-label-md text-on-surface font-semibold"}>
{"Dung lượng RAM"}
                    </h3>
                    <div className={"grid grid-cols-3 gap-2 mt-1"}>
                      <button className={"py-2 px-1 rounded-xl bg-surface-container font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-high transition-colors text-center"} type={"button"}>
{"8 GB"}
                      </button>
                      <button className={"py-2 px-1 rounded-xl bg-primary text-on-primary font-label-sm text-label-sm font-semibold text-center shadow-sm"} type={"button"}>
{"12 GB"}
                      </button>
                      <button className={"py-2 px-1 rounded-xl bg-surface-container font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-high transition-colors text-center"} type={"button"}>
{"16 GB"}
                      </button>
                    </div>
                  </div>
                  <div className={"flex flex-col gap-space-xs pt-space-xs"}>
                    <h3 className={"font-label-md text-label-md text-on-surface font-semibold"}>
{"Bộ nhớ trong (ROM)"}
                    </h3>
                    <div className={"grid grid-cols-2 gap-2 mt-1"}>
                      <button className={"py-2 px-2 rounded-xl bg-surface-container font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-high transition-colors text-center"} type={"button"}>
{"128 GB"}
                      </button>
                      <button className={"py-2 px-2 rounded-xl bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold text-center"} type={"button"}>
{"256 GB"}
                      </button>
                      <button className={"py-2 px-2 rounded-xl bg-surface-container font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-high transition-colors text-center"} type={"button"}>
{"512 GB"}
                      </button>
                      <button className={"py-2 px-2 rounded-xl bg-surface-container font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-high transition-colors text-center"} type={"button"}>
{"1 TB"}
                      </button>
                    </div>
                  </div>
                  <div className={"flex flex-col gap-space-xs pt-space-xs"}>
                    <h3 className={"font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5"}>
                      <span className={"material-symbols-outlined text-[16px] text-secondary"}>
{"psychology"}
                      </span>
{" Tính năng AI & Công nghệ "}
                    </h3>
                    <div className={"flex flex-col gap-2 mt-1"}>
                      <label className={"flex items-center gap-2.5 cursor-pointer"}>
                        <input defaultChecked={true} className={"w-4 h-4 rounded text-secondary focus:ring-secondary accent-secondary cursor-pointer"} type={"checkbox"} />
                        <span className={"font-body-sm text-body-sm text-on-surface"}>
{"Apple Intelligence"}
                        </span>
                      </label>
                      <label className={"flex items-center gap-2.5 cursor-pointer"}>
                        <input className={"w-4 h-4 rounded text-secondary focus:ring-secondary accent-secondary cursor-pointer"} type={"checkbox"} />
                        <span className={"font-body-sm text-body-sm text-on-surface"}>
{"Galaxy AI"}
                        </span>
                      </label>
                      <label className={"flex items-center gap-2.5 cursor-pointer"}>
                        <input className={"w-4 h-4 rounded text-secondary focus:ring-secondary accent-secondary cursor-pointer"} type={"checkbox"} />
                        <span className={"font-body-sm text-body-sm text-on-surface"}>
{"Camera tiềm vọng (Periscope)"}
                        </span>
                      </label>
                      <label className={"flex items-center gap-2.5 cursor-pointer"}>
                        <input className={"w-4 h-4 rounded text-secondary focus:ring-secondary accent-secondary cursor-pointer"} type={"checkbox"} />
                        <span className={"font-body-sm text-body-sm text-on-surface"}>
{"Màn hình LTPO 120Hz"}
                        </span>
                      </label>
                      <label className={"flex items-center gap-2.5 cursor-pointer"}>
                        <input className={"w-4 h-4 rounded text-secondary focus:ring-secondary accent-secondary cursor-pointer"} type={"checkbox"} />
                        <span className={"font-body-sm text-body-sm text-on-surface"}>
{"Chip xử lý 3nm"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className={"rounded-xl bg-gradient-to-br from-secondary-fixed/50 to-primary-fixed/40 p-space-md shadow-sm relative overflow-hidden"}>
                  <div className={"relative z-10 flex flex-col gap-space-sm"}>
                    <div className={"flex items-center gap-2 text-secondary font-semibold font-label-md text-label-md"}>
                      <span className={"material-symbols-outlined text-[20px]"}>
{"smart_toy"}
                      </span>
{" Tư vấn chuẩn xác AI "}
                    </div>
                    <p className={"font-body-sm text-body-sm text-on-surface leading-relaxed"}>
{" Chưa biết chọn máy nào? Hãy để AI phân tích theo nhu cầu làm việc và phong cách chụp ảnh của bạn. "}
                    </p>
                    <button className={"mt-1 w-full py-2.5 px-3 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 shadow-md hover:bg-secondary-container transition-all"} type={"button"}>
                      <span className={"material-symbols-outlined text-[18px]"}>
{"auto_awesome"}
                      </span>
{" Tư vấn cùng AI ✨ "}
                    </button>
                  </div>
                </div>
              </aside>
              <main className={"lg:col-span-9 flex flex-col gap-space-xl"}>
                <div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md"}>
                  <div className={"group bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative"}>
                    <div className={"flex flex-col"}>
                      <div className={"flex items-center justify-between mb-space-sm"}>
                        <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold"}>
                          <span className={"material-symbols-outlined text-[12px]"}>
{"auto_awesome"}
                          </span>
{" Apple Intelligence "}
                        </span>
                        <label className={"flex items-center gap-1.5 cursor-pointer text-on-surface-variant hover:text-primary transition-colors font-caption text-caption"} title={"Thêm vào danh sách so sánh"}>
                          <input className={"w-3.5 h-3.5 rounded accent-primary text-primary cursor-pointer"} type={"checkbox"} />
                          <span>
{"So sánh"}
                          </span>
                        </label>
                      </div>
                      <div className={"w-full h-56 bg-surface-container-low rounded-xl mb-space-md flex items-center justify-center p-space-sm overflow-hidden relative group-hover:bg-surface-container transition-colors"}>
                        <img alt={"iPhone 16 Pro Max"} className={"h-48 w-auto object-contain transition-transform duration-300 group-hover:scale-105"} data-alt={"Apple iPhone 16 Pro Max in Natural Titanium finish, dramatic studio lighting showcasing the ceramic shield glass and titanium textured frame, clean tech product aesthetic on light alabaster gradient backdrop"} src={"/images/7a3be82fc743ac21.webp"} />
                        <div className={"absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm shadow-sm"}>
                          <span className={"w-2.5 h-2.5 rounded-full bg-[#B2ABA2] ring-1 ring-on-surface/20"} title={"Titan Tự Nhiên"}>

                          </span>
                          <span className={"w-2.5 h-2.5 rounded-full bg-[#E3E4E5]"} title={"Titan Trắng"}>

                          </span>
                          <span className={"w-2.5 h-2.5 rounded-full bg-[#3B3A3E]"} title={"Titan Đen"}>

                          </span>
                          <span className={"w-2.5 h-2.5 rounded-full bg-[#C2A38E]"} title={"Titan Sa Mạc"}>

                          </span>
                        </div>
                      </div>
                      <div className={"flex flex-col gap-1"}>
                        <span className={"font-caption text-caption text-on-surface-variant"}>
{"Titan Tự Nhiên • 256GB"}
                        </span>
                        <h3 className={"font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors"}>
{"iPhone 16 Pro Max"}
                        </h3>
                        <p className={"font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2"}>
{"Chip A18 Pro 3nm vượt trội, Màn hình 6.9\" Super Retina XDR OLED 120Hz ProMotion."}
                        </p>
                      </div>
                      <div className={"grid grid-cols-2 gap-2 my-space-sm p-2 rounded-lg bg-surface-container-low font-caption text-caption text-on-surface-variant"}>
                        <div className={"flex items-center gap-1"}>
                          <span className={"material-symbols-outlined text-[15px] text-primary"}>
{"memory"}
                          </span>
                          <span>
{"A18 Pro 3nm"}
                          </span>
                        </div>
                        <div className={"flex items-center gap-1"}>
                          <span className={"material-symbols-outlined text-[15px] text-primary"}>
{"photo_camera"}
                          </span>
                          <span>
{"48MP Fusion 5x"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={"flex flex-col gap-space-sm pt-space-xs mt-space-xs"}>
                      <div className={"flex items-baseline justify-between"}>
                        <div>
                          <span className={"font-caption text-caption text-outline"}>
{"Giá niêm yết"}
                          </span>
                          <div className={"font-headline-sm text-headline-sm font-bold text-primary"}>
{"34.990.000₫"}
                          </div>
                        </div>
                        <span className={"inline-flex items-center gap-1 font-caption text-caption text-[#16A34A] font-semibold bg-[#DCFCE7] px-2 py-0.5 rounded-full"}>
                          <span className={"material-symbols-outlined text-[13px]"}>
{"local_shipping"}
                          </span>
{" COD "}
                        </span>
                      </div>
                      <div className={"grid grid-cols-2 gap-2"}>
                        <button className={"py-2.5 px-3 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors text-center"} type={"button"}>
{" So sánh "}
                        </button>
                        <a className={"py-2.5 px-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold text-center hover:bg-primary-container transition-all shadow-sm"} href={"#"}>
{" Xem chi tiết "}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className={"group bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative"}>
                    <div className={"flex flex-col"}>
                      <div className={"flex items-center justify-between mb-space-sm"}>
                        <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold"}>
                          <span className={"material-symbols-outlined text-[12px]"}>
{"auto_awesome"}
                          </span>
{" Galaxy AI "}
                        </span>
                        <label className={"flex items-center gap-1.5 cursor-pointer text-on-surface-variant hover:text-primary transition-colors font-caption text-caption"} title={"Thêm vào danh sách so sánh"}>
                          <input className={"w-3.5 h-3.5 rounded accent-primary text-primary cursor-pointer"} type={"checkbox"} />
                          <span>
{"So sánh"}
                          </span>
                        </label>
                      </div>
                      <div className={"w-full h-56 bg-surface-container-low rounded-xl mb-space-md flex items-center justify-center p-space-sm overflow-hidden relative group-hover:bg-surface-container transition-colors"}>
                        <img alt={"Samsung Galaxy S24 Ultra"} className={"h-48 w-auto object-contain transition-transform duration-300 group-hover:scale-105"} data-alt={"Samsung Galaxy S24 Ultra in Titanium Gray finish with integrated S Pen stylus beside it, modern studio lighting emphasizing flat screen, matte titanium frame, sharp minimal tech styling"} src={"/images/3f8cd5940d6aa104.webp"} />
                        <div className={"absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm shadow-sm"}>
                          <span className={"w-2.5 h-2.5 rounded-full bg-[#7C7A7C] ring-1 ring-on-surface/20"} title={"Titan Xám"}>

                          </span>
                          <span className={"w-2.5 h-2.5 rounded-full bg-[#2C2C2E]"} title={"Titan Đen"}>

                          </span>
                          <span className={"w-2.5 h-2.5 rounded-full bg-[#625983]"} title={"Titan Tím"}>

                          </span>
                          <span className={"w-2.5 h-2.5 rounded-full bg-[#D6CEB5]"} title={"Titan Vàng"}>

                          </span>
                        </div>
                      </div>
                      <div className={"flex flex-col gap-1"}>
                        <span className={"font-caption text-caption text-on-surface-variant"}>
{"Titan Xám • 256GB"}
                        </span>
                        <h3 className={"font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors"}>
{"Galaxy S24 Ultra"}
                        </h3>
                        <p className={"font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2"}>
{"Snapdragon 8 Gen 3 for Galaxy, Camera 200MP chuyên nghiệp, bút S-Pen quyền năng."}
                        </p>
                      </div>
                      <div className={"grid grid-cols-2 gap-2 my-space-sm p-2 rounded-lg bg-surface-container-low font-caption text-caption text-on-surface-variant"}>
                        <div className={"flex items-center gap-1"}>
                          <span className={"material-symbols-outlined text-[15px] text-primary"}>
{"bolt"}
                          </span>
                          <span>
{"Snapdragon 8 Gen 3"}
                          </span>
                        </div>
                        <div className={"flex items-center gap-1"}>
                          <span className={"material-symbols-outlined text-[15px] text-primary"}>
{"photo_camera"}
                          </span>
                          <span>
{"200MP Zoom 100x"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={"flex flex-col gap-space-sm pt-space-xs mt-space-xs"}>
                      <div className={"flex items-baseline justify-between"}>
                        <div>
                          <span className={"font-caption text-caption text-outline"}>
{"Giá niêm yết"}
                          </span>
                          <div className={"font-headline-sm text-headline-sm font-bold text-primary"}>
{"28.490.000₫"}
                          </div>
                        </div>
                        <span className={"inline-flex items-center gap-1 font-caption text-caption text-[#16A34A] font-semibold bg-[#DCFCE7] px-2 py-0.5 rounded-full"}>
                          <span className={"material-symbols-outlined text-[13px]"}>
{"local_shipping"}
                          </span>
{" COD "}
                        </span>
                      </div>
                      <div className={"grid grid-cols-2 gap-2"}>
                        <button className={"py-2.5 px-3 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors text-center"} type={"button"}>
{" So sánh "}
                        </button>
                        <a className={"py-2.5 px-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold text-center hover:bg-primary-container transition-all shadow-sm"} href={"#"}>
{" Xem chi tiết "}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className={"group bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative"}>
                    <div className={"flex flex-col"}>
                      <div className={"flex items-center justify-between mb-space-sm"}>
                        <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold"}>
                          <span className={"material-symbols-outlined text-[12px]"}>
{"auto_awesome"}
                          </span>
{" Apple Intelligence "}
                        </span>
                        <label className={"flex items-center gap-1.5 cursor-pointer text-on-surface-variant hover:text-primary transition-colors font-caption text-caption"} title={"Thêm vào danh sách so sánh"}>
                          <input className={"w-3.5 h-3.5 rounded accent-primary text-primary cursor-pointer"} type={"checkbox"} />
                          <span>
{"So sánh"}
                          </span>
                        </label>
                      </div>
                      <div className={"w-full h-56 bg-surface-container-low rounded-xl mb-space-md flex items-center justify-center p-space-sm overflow-hidden relative group-hover:bg-surface-container transition-colors"}>
                        <img alt={"iPhone 16 Pro"} className={"h-48 w-auto object-contain transition-transform duration-300 group-hover:scale-105"} data-alt={"Apple iPhone 16 Pro in Desert Titanium warm bronze tone, sleek luxury minimalist flagship phone angled render against pure neutral studio setting with subtle reflections"} src={"/images/d5d763a17ed65b6c.webp"} />
                        <div className={"absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm shadow-sm"}>
                          <span className={"w-2.5 h-2.5 rounded-full bg-[#C2A38E] ring-1 ring-on-surface/20"} title={"Titan Sa Mạc"}>

                          </span>
                          <span className={"w-2.5 h-2.5 rounded-full bg-[#B2ABA2]"} title={"Titan Tự Nhiên"}>

                          </span>
                          <span className={"w-2.5 h-2.5 rounded-full bg-[#E3E4E5]"} title={"Titan Trắng"}>

                          </span>
                          <span className={"w-2.5 h-2.5 rounded-full bg-[#3B3A3E]"} title={"Titan Đen"}>

                          </span>
                        </div>
                      </div>
                      <div className={"flex flex-col gap-1"}>
                        <span className={"font-caption text-caption text-on-surface-variant"}>
{"Titan Sa Mạc • 128GB"}
                        </span>
                        <h3 className={"font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors"}>
{"iPhone 16 Pro"}
                        </h3>
                        <p className={"font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2"}>
{"Camera 48MP Fusion 5x Telephoto mới, Chip A18 Pro hỗ trợ AI thế hệ kế tiếp."}
                        </p>
                      </div>
                      <div className={"grid grid-cols-2 gap-2 my-space-sm p-2 rounded-lg bg-surface-container-low font-caption text-caption text-on-surface-variant"}>
                        <div className={"flex items-center gap-1"}>
                          <span className={"material-symbols-outlined text-[15px] text-primary"}>
{"memory"}
                          </span>
                          <span>
{"A18 Pro 3nm"}
                          </span>
                        </div>
                        <div className={"flex items-center gap-1"}>
                          <span className={"material-symbols-outlined text-[15px] text-primary"}>
{"speed"}
                          </span>
                          <span>
{"120Hz ProMotion"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={"flex flex-col gap-space-sm pt-space-xs mt-space-xs"}>
                      <div className={"flex items-baseline justify-between"}>
                        <div>
                          <span className={"font-caption text-caption text-outline"}>
{"Giá niêm yết"}
                          </span>
                          <div className={"font-headline-sm text-headline-sm font-bold text-primary"}>
{"28.990.000₫"}
                          </div>
                        </div>
                        <span className={"inline-flex items-center gap-1 font-caption text-caption text-[#16A34A] font-semibold bg-[#DCFCE7] px-2 py-0.5 rounded-full"}>
                          <span className={"material-symbols-outlined text-[13px]"}>
{"local_shipping"}
                          </span>
{" COD "}
                        </span>
                      </div>
                      <div className={"grid grid-cols-2 gap-2"}>
                        <button className={"py-2.5 px-3 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors text-center"} type={"button"}>
{" So sánh "}
                        </button>
                        <a className={"py-2.5 px-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold text-center hover:bg-primary-container transition-all shadow-sm"} href={"#"}>
{" Xem chi tiết "}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className={"group bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative"}>
                    <div className={"flex flex-col"}>
                      <div className={"flex items-center justify-between mb-space-sm"}>
                        <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-caption text-caption font-semibold"}>
                          <span className={"material-symbols-outlined text-[12px]"}>
{"camera"}
                          </span>
{" Leica Quad 1-inch "}
                        </span>
                        <label className={"flex items-center gap-1.5 cursor-pointer text-on-surface-variant hover:text-primary transition-colors font-caption text-caption"} title={"Thêm vào danh sách so sánh"}>
                          <input className={"w-3.5 h-3.5 rounded accent-primary text-primary cursor-pointer"} type={"checkbox"} />
                          <span>
{"So sánh"}
                          </span>
                        </label>
                      </div>
                      <div className={"w-full h-56 bg-surface-container-low rounded-xl mb-space-md flex items-center justify-center p-space-sm overflow-hidden relative group-hover:bg-surface-container transition-colors"}>
                        <img alt={"Xiaomi 14 Ultra"} className={"h-48 w-auto object-contain transition-transform duration-300 group-hover:scale-105"} data-alt={"Xiaomi 14 Ultra flagship phone in premium Black Ceramic finish featuring prominent Leica circular camera module with four lenses, pristine minimalist studio lighting on light surface"} src={"/images/37610803aa06b819.webp"} />
                        <div className={"absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm shadow-sm"}>
                          <span className={"w-2.5 h-2.5 rounded-full bg-[#1C1C1E] ring-1 ring-on-surface/20"} title={"Đen Ceramic"}>

                          </span>
                          <span className={"w-2.5 h-2.5 rounded-full bg-[#F5F5F7]"} title={"Trắng Ceramic"}>

                          </span>
                        </div>
                      </div>
                      <div className={"flex flex-col gap-1"}>
                        <span className={"font-caption text-caption text-on-surface-variant"}>
{"Đen Ceramic • 512GB"}
                        </span>
                        <h3 className={"font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors"}>
{"Xiaomi 14 Ultra"}
                        </h3>
                        <p className={"font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2"}>
{"Hệ thống 4 camera Leica 50MP cảm biến 1 inch LYT-900, Màn hình 2K AMOLED 120Hz."}
                        </p>
                      </div>
                      <div className={"grid grid-cols-2 gap-2 my-space-sm p-2 rounded-lg bg-surface-container-low font-caption text-caption text-on-surface-variant"}>
                        <div className={"flex items-center gap-1"}>
                          <span className={"material-symbols-outlined text-[15px] text-primary"}>
{"bolt"}
                          </span>
                          <span>
{"Snapdragon 8 Gen 3"}
                          </span>
                        </div>
                        <div className={"flex items-center gap-1"}>
                          <span className={"material-symbols-outlined text-[15px] text-primary"}>
{"battery_charging_full"}
                          </span>
                          <span>
{"90W HyperCharge"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={"flex flex-col gap-space-sm pt-space-xs mt-space-xs"}>
                      <div className={"flex items-baseline justify-between"}>
                        <div>
                          <span className={"font-caption text-caption text-outline"}>
{"Giá niêm yết"}
                          </span>
                          <div className={"font-headline-sm text-headline-sm font-bold text-primary"}>
{"25.990.000₫"}
                          </div>
                        </div>
                        <span className={"inline-flex items-center gap-1 font-caption text-caption text-[#16A34A] font-semibold bg-[#DCFCE7] px-2 py-0.5 rounded-full"}>
                          <span className={"material-symbols-outlined text-[13px]"}>
{"local_shipping"}
                          </span>
{" COD "}
                        </span>
                      </div>
                      <div className={"grid grid-cols-2 gap-2"}>
                        <button className={"py-2.5 px-3 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors text-center"} type={"button"}>
{" So sánh "}
                        </button>
                        <a className={"py-2.5 px-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold text-center hover:bg-primary-container transition-all shadow-sm"} href={"#"}>
{" Xem chi tiết "}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className={"group bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative"}>
                    <div className={"flex flex-col"}>
                      <div className={"flex items-center justify-between mb-space-sm"}>
                        <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold"}>
                          <span className={"material-symbols-outlined text-[12px]"}>
{"auto_awesome"}
                          </span>
{" AI HyperTone "}
                        </span>
                        <label className={"flex items-center gap-1.5 cursor-pointer text-on-surface-variant hover:text-primary transition-colors font-caption text-caption"} title={"Thêm vào danh sách so sánh"}>
                          <input className={"w-3.5 h-3.5 rounded accent-primary text-primary cursor-pointer"} type={"checkbox"} />
                          <span>
{"So sánh"}
                          </span>
                        </label>
                      </div>
                      <div className={"w-full h-56 bg-surface-container-low rounded-xl mb-space-md flex items-center justify-center p-space-sm overflow-hidden relative group-hover:bg-surface-container transition-colors"}>
                        <img alt={"OPPO Find X7 Ultra"} className={"h-48 w-auto object-contain transition-transform duration-300 group-hover:scale-105"} data-alt={"OPPO Find X7 Ultra in Brown Vegan Leather and silver glass duo finish, dual periscope zoom lens flagship phone shown on minimalist white studio display"} src={"/images/3e9fdc9f8aac968f.webp"} />
                        <div className={"absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm shadow-sm"}>
                          <span className={"w-2.5 h-2.5 rounded-full bg-[#8E583C] ring-1 ring-on-surface/20"} title={"Nâu Da"}>

                          </span>
                          <span className={"w-2.5 h-2.5 rounded-full bg-[#18233C]"} title={"Xanh Đại Dương"}>

                          </span>
                          <span className={"w-2.5 h-2.5 rounded-full bg-[#1C1C1E]"} title={"Đen Đẳng Cấp"}>

                          </span>
                        </div>
                      </div>
                      <div className={"flex flex-col gap-1"}>
                        <span className={"font-caption text-caption text-on-surface-variant"}>
{"Nâu Da Cao Cấp • 256GB"}
                        </span>
                        <h3 className={"font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors"}>
{"OPPO Find X7 Ultra"}
                        </h3>
                        <p className={"font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2"}>
{"Camera Dual Periscope tiềm vọng kép đầu tiên trên thế giới, Hasselblad Portrait, Sạc 100W."}
                        </p>
                      </div>
                      <div className={"grid grid-cols-2 gap-2 my-space-sm p-2 rounded-lg bg-surface-container-low font-caption text-caption text-on-surface-variant"}>
                        <div className={"flex items-center gap-1"}>
                          <span className={"material-symbols-outlined text-[15px] text-primary"}>
{"view_in_ar"}
                          </span>
                          <span>
{"Dual Periscope"}
                          </span>
                        </div>
                        <div className={"flex items-center gap-1"}>
                          <span className={"material-symbols-outlined text-[15px] text-primary"}>
{"flash_on"}
                          </span>
                          <span>
{"100W SuperVOOC"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={"flex flex-col gap-space-sm pt-space-xs mt-space-xs"}>
                      <div className={"flex items-baseline justify-between"}>
                        <div>
                          <span className={"font-caption text-caption text-outline"}>
{"Giá niêm yết"}
                          </span>
                          <div className={"font-headline-sm text-headline-sm font-bold text-primary"}>
{"21.990.000₫"}
                          </div>
                        </div>
                        <span className={"inline-flex items-center gap-1 font-caption text-caption text-[#16A34A] font-semibold bg-[#DCFCE7] px-2 py-0.5 rounded-full"}>
                          <span className={"material-symbols-outlined text-[13px]"}>
{"local_shipping"}
                          </span>
{" COD "}
                        </span>
                      </div>
                      <div className={"grid grid-cols-2 gap-2"}>
                        <button className={"py-2.5 px-3 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors text-center"} type={"button"}>
{" So sánh "}
                        </button>
                        <a className={"py-2.5 px-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold text-center hover:bg-primary-container transition-all shadow-sm"} href={"#"}>
{" Xem chi tiết "}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className={"group bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative"}>
                    <div className={"flex flex-col"}>
                      <div className={"flex items-center justify-between mb-space-sm"}>
                        <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-caption text-caption font-semibold"}>
                          <span className={"material-symbols-outlined text-[12px]"}>
{"filter_vintage"}
                          </span>
{" Ống kính ZEISS APO "}
                        </span>
                        <label className={"flex items-center gap-1.5 cursor-pointer text-on-surface-variant hover:text-primary transition-colors font-caption text-caption"} title={"Thêm vào danh sách so sánh"}>
                          <input className={"w-3.5 h-3.5 rounded accent-primary text-primary cursor-pointer"} type={"checkbox"} />
                          <span>
{"So sánh"}
                          </span>
                        </label>
                      </div>
                      <div className={"w-full h-56 bg-surface-container-low rounded-xl mb-space-md flex items-center justify-center p-space-sm overflow-hidden relative group-hover:bg-surface-container transition-colors"}>
                        <img alt={"vivo X100 Pro"} className={"h-48 w-auto object-contain transition-transform duration-300 group-hover:scale-105"} data-alt={"vivo X100 Pro smartphone in Sunset Orange leather and Starry Cyan glass version featuring large circular ZEISS camera ring, modern luxury tech product photography"} src={"/images/4350531d6ae81fe8.webp"} />
                        <div className={"absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm shadow-sm"}>
                          <span className={"w-2.5 h-2.5 rounded-full bg-[#5390AF] ring-1 ring-on-surface/20"} title={"Xanh Thiên Thanh"}>

                          </span>
                          <span className={"w-2.5 h-2.5 rounded-full bg-[#E57A44]"} title={"Cam Hoàng Hôn"}>

                          </span>
                          <span className={"w-2.5 h-2.5 rounded-full bg-[#1C1C1E]"} title={"Đen Tinh Vân"}>

                          </span>
                        </div>
                      </div>
                      <div className={"flex flex-col gap-1"}>
                        <span className={"font-caption text-caption text-on-surface-variant"}>
{"Xanh Thiên Thanh • 256GB"}
                        </span>
                        <h3 className={"font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors"}>
{"vivo X100 Pro"}
                        </h3>
                        <p className={"font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2"}>
{"Cảm biến ZEISS 1-inch, Chip xử lý hình ảnh V3 độc quyền kết hợp Dimensity 9300."}
                        </p>
                      </div>
                      <div className={"grid grid-cols-2 gap-2 my-space-sm p-2 rounded-lg bg-surface-container-low font-caption text-caption text-on-surface-variant"}>
                        <div className={"flex items-center gap-1"}>
                          <span className={"material-symbols-outlined text-[15px] text-primary"}>
{"memory"}
                          </span>
                          <span>
{"Dimensity 9300"}
                          </span>
                        </div>
                        <div className={"flex items-center gap-1"}>
                          <span className={"material-symbols-outlined text-[15px] text-primary"}>
{"photo_camera"}
                          </span>
                          <span>
{"ZEISS 1-inch APO"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={"flex flex-col gap-space-sm pt-space-xs mt-space-xs"}>
                      <div className={"flex items-baseline justify-between"}>
                        <div>
                          <span className={"font-caption text-caption text-outline"}>
{"Giá niêm yết"}
                          </span>
                          <div className={"font-headline-sm text-headline-sm font-bold text-primary"}>
{"19.990.000₫"}
                          </div>
                        </div>
                        <span className={"inline-flex items-center gap-1 font-caption text-caption text-[#16A34A] font-semibold bg-[#DCFCE7] px-2 py-0.5 rounded-full"}>
                          <span className={"material-symbols-outlined text-[13px]"}>
{"local_shipping"}
                          </span>
{" COD "}
                        </span>
                      </div>
                      <div className={"grid grid-cols-2 gap-2"}>
                        <button className={"py-2.5 px-3 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors text-center"} type={"button"}>
{" So sánh "}
                        </button>
                        <a className={"py-2.5 px-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold text-center hover:bg-primary-container transition-all shadow-sm"} href={"#"}>
{" Xem chi tiết "}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={"flex items-center justify-between pt-space-md pb-space-lg"}>
                  <div className={"font-caption text-caption text-on-surface-variant"}>
{" Hiển thị "}
                    <span className={"font-semibold text-on-surface"}>
{"1 - 6"}
                    </span>
{" trong "}
                    <span className={"font-semibold text-on-surface"}>
{"24"}
                    </span>
{" thiết bị "}
                  </div>
                  <div className={"flex items-center gap-1.5"}>
                    <button aria-label={"Trang trước"} className={"w-10 h-10 rounded-xl bg-surface-container text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center disabled:opacity-40"} disabled={true} type={"button"}>
                      <span className={"material-symbols-outlined text-[18px]"}>
{"chevron_left"}
                      </span>
                    </button>
                    <button className={"w-10 h-10 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-sm flex items-center justify-center"} type={"button"}>
{" 1 "}
                    </button>
                    <button className={"w-10 h-10 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center justify-center"} type={"button"}>
{" 2 "}
                    </button>
                    <button className={"w-10 h-10 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center justify-center"} type={"button"}>
{" 3 "}
                    </button>
                    <button className={"w-10 h-10 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center justify-center"} type={"button"}>
{" 4 "}
                    </button>
                    <button aria-label={"Trang sau"} className={"w-10 h-10 rounded-xl bg-surface-container text-on-surface hover:text-primary hover:bg-surface-container-high transition-colors flex items-center justify-center"} type={"button"}>
                      <span className={"material-symbols-outlined text-[18px]"}>
{"chevron_right"}
                      </span>
                    </button>
                  </div>
                </div>
              </main>
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
