// Converted from tr_l_ai_x_c_nh_n_chuy_n_ch_smartphone_ai/code.html. Read-only design reference.
// Inline scripts were replaced by React state in src/pages and src/features.
export default function ChatDesign() {
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
          <div className={"w-full max-w-[1440px] mx-auto px-4 lg:px-8 py-6"}>
            <div className={"w-full bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[820px] max-h-[880px] relative"}>
              <aside className={"w-full md:w-[320px] lg:w-[300px] shrink-0 bg-surface-container-low flex flex-col justify-between"}>
                <div className={"p-4 flex flex-col gap-4"}>
                  <button className={"w-full py-3 px-4 rounded-xl bg-surface-container-lowest hover:bg-primary-fixed text-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-sm transition-all duration-200 group"} type={"button"}>
                    <span className={"material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:rotate-90"}>
{"add_circle"}
                    </span>
{" Cuộc trò chuyện mới "}
                  </button>
                  <div className={"flex items-center gap-1 p-1 bg-surface-container rounded-xl overflow-x-auto no-scrollbar"}>
                    <button className={"px-2.5 py-1.5 rounded-lg bg-surface-container-lowest text-primary font-label-sm text-label-sm font-semibold shadow-sm transition-all whitespace-nowrap"} type="button">
{"Tất cả"}
                    </button>
                    <button className={"px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm transition-all whitespace-nowrap"} type="button">
{"Tư vấn"}
                    </button>
                    <button className={"px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm transition-all whitespace-nowrap"} type="button">
{"So sánh"}
                    </button>
                    <button className={"px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm transition-all whitespace-nowrap"} type="button">
{"RAG Policy"}
                    </button>
                  </div>
                  <div className={"flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-1"}>
                    <div className={"flex items-center justify-between px-2 pt-1"}>
                      <span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>
{"Hôm nay"}
                      </span>
                      <span className={"font-caption text-caption text-outline-variant"}>
{"2 phiên"}
                      </span>
                    </div>
                    <div className={"p-3 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-2 relative cursor-pointer group"}>
                      <div className={"flex items-center justify-between gap-2"}>
                        <span className={"inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-caption text-caption font-semibold"}>
                          <span className={"material-symbols-outlined text-[13px]"}>
{"shopping_bag"}
                          </span>
{" Tư vấn mua máy "}
                        </span>
                        <span className={"font-caption text-caption text-outline"}>
{"10:42"}
                        </span>
                      </div>
                      <p className={"font-label-md text-label-md text-on-surface font-semibold truncate leading-tight"}>
{" Tư vấn iPhone 16 Pro vs S24 Ultra "}
                      </p>
                      <p className={"font-body-sm text-body-sm text-on-surface-variant line-clamp-1"}>
{" Ngân sách 25-30 triệu, chụp ảnh & pin trâu... "}
                      </p>
                      <div className={"absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r"}>

                      </div>
                    </div>
                    <div className={"p-3 rounded-xl hover:bg-surface-container transition-all cursor-pointer flex flex-col gap-1.5 group"}>
                      <div className={"flex items-center justify-between gap-2"}>
                        <span className={"inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-caption text-caption font-semibold"}>
                          <span className={"material-symbols-outlined text-[13px]"}>
{"compare_arrows"}
                          </span>
{" So sánh "}
                        </span>
                        <span className={"font-caption text-caption text-outline"}>
{"09:15"}
                        </span>
                      </div>
                      <p className={"font-label-md text-label-md text-on-surface font-medium truncate"}>
{" So sánh S24 Ultra & Xiaomi 14 Ultra "}
                      </p>
                    </div>
                    <div className={"flex items-center justify-between px-2 pt-3"}>
                      <span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>
{"Hôm qua"}
                      </span>
                      <span className={"font-caption text-caption text-outline-variant"}>
{"2 phiên"}
                      </span>
                    </div>
                    <div className={"p-3 rounded-xl hover:bg-surface-container transition-all cursor-pointer flex flex-col gap-1.5"}>
                      <div className={"flex items-center justify-between gap-2"}>
                        <span className={"inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-caption text-caption font-semibold"}>
                          <span className={"material-symbols-outlined text-[13px]"}>
{"verified_user"}
                          </span>
{" Hỗ trợ cửa hàng "}
                        </span>
                        <span className={"font-caption text-caption text-outline"}>
{"16:20"}
                        </span>
                      </div>
                      <p className={"font-label-md text-label-md text-on-surface font-medium truncate"}>
{" Chính sách bảo hành đổi trả 7 ngày "}
                      </p>
                    </div>
                    <div className={"p-3 rounded-xl hover:bg-surface-container transition-all cursor-pointer flex flex-col gap-1.5"}>
                      <div className={"flex items-center justify-between gap-2"}>
                        <span className={"inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption font-semibold"}>
                          <span className={"material-symbols-outlined text-[13px]"}>
{"psychology"}
                          </span>
{" Trò chuyện AI "}
                        </span>
                        <span className={"font-caption text-caption text-outline"}>
{"14:02"}
                        </span>
                      </div>
                      <p className={"font-label-md text-label-md text-on-surface font-medium truncate"}>
{" Giải thích tiến trình 3nm và NPU trên A18 Pro "}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={"p-4 bg-surface-container m-3 rounded-xl flex items-center gap-3"}>
                  <div className={"w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-on-secondary shrink-0 shadow-sm"}>
                    <span className={"material-symbols-outlined text-[18px]"}>
{"database"}
                    </span>
                  </div>
                  <div className={"flex flex-col min-w-0"}>
                    <div className={"flex items-center gap-1.5"}>
                      <span className={"w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"}>

                      </span>
                      <span className={"font-label-sm text-label-sm font-semibold text-on-surface"}>
{"RAG Store Kích hoạt"}
                      </span>
                    </div>
                    <p className={"font-caption text-caption text-on-surface-variant truncate"}>
{"Đồng bộ chính sách & bảng giá thời gian thực"}
                    </p>
                  </div>
                </div>
              </aside>
              <section className={"flex-1 flex flex-col bg-surface-container-lowest overflow-hidden"}>
                <header className={"px-6 py-3.5 bg-surface-container-lowest flex items-center justify-between shrink-0 shadow-sm z-10"}>
                  <div className={"flex items-center gap-3"}>
                    <div className={"flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant"}>
                      <span className={"material-symbols-outlined text-[18px] text-primary"}>
{"assistant"}
                      </span>
                      <span className={"font-label-sm text-label-sm font-semibold"}>
{"Chủ đề: Tư vấn mua điện thoại"}
                      </span>
                    </div>
                    <button className={"hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm transition-all"} type={"button"}>
                      <span>
{"Đổi chủ đề"}
                      </span>
                      <span className={"material-symbols-outlined text-[16px] text-outline"}>
{"unfold_more"}
                      </span>
                    </button>
                  </div>
                  <div className={"flex items-center gap-1 text-on-surface-variant"}>
                    <button aria-label={"Xóa bộ nhớ tạm"} className={"w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container transition-all"} title={"Xóa ngữ cảnh hiện tại"} type={"button"}>
                      <span className={"material-symbols-outlined text-[20px]"}>
{"restart_alt"}
                      </span>
                    </button>
                    <button aria-label={"Xuất hội thoại"} className={"w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container transition-all"} title={"Xuất nội dung trò chuyện"} type={"button"}>
                      <span className={"material-symbols-outlined text-[20px]"}>
{"ios_share"}
                      </span>
                    </button>
                    <button aria-label={"Cài đặt mô hình AI"} className={"w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container transition-all"} title={"Tùy chỉnh thông số NPU"} type={"button"}>
                      <span className={"material-symbols-outlined text-[20px]"}>
{"tune"}
                      </span>
                    </button>
                  </div>
                </header>
                <div className={"flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-surface"}>
                  <div className={"flex justify-end"}>
                    <div className={"max-w-[85%] md:max-w-[70%] bg-surface-container-high text-on-surface px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-sm"}>
                      <p className={"font-body-md text-body-md leading-relaxed"}>
{" Mình đang có ngân sách khoảng 25-30 triệu, cần một máy chụp ảnh đẹp, màn hình lớn và pin tốt để làm việc. "}
                      </p>
                      <div className={"flex justify-end items-center gap-1.5 mt-1"}>
                        <span className={"font-caption text-caption text-outline"}>
{"10:41"}
                        </span>
                        <span className={"material-symbols-outlined text-[14px] text-primary"}>
{"done_all"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={"flex gap-3 max-w-[96%] md:max-w-[90%]"}>
                    <div className={"w-9 h-9 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-md"}>
                      <span className={"material-symbols-outlined text-[20px]"}>
{"auto_awesome"}
                      </span>
                    </div>
                    <div className={"flex flex-col gap-4 flex-1"}>
                      <div className={"bg-surface-container-lowest p-5 rounded-2xl rounded-tl-sm shadow-sm flex flex-col gap-4"}>
                        <div className={"flex items-center justify-between"}>
                          <div className={"flex items-center gap-2"}>
                            <span className={"font-label-md text-label-md font-semibold text-on-surface"}>
{"Trợ lý Cố vấn SmartPhone AI"}
                            </span>
                            <span className={"px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption"}>
{"NPU Engine v4.2"}
                            </span>
                          </div>
                          <span className={"font-caption text-caption text-outline"}>
{"10:41"}
                          </span>
                        </div>
                        <p className={"font-body-md text-body-md text-on-surface leading-relaxed"}>
{" Chào bạn! Với tầm giá "}
                          <strong className={"text-primary font-semibold"}>
{"25 - 30 triệu VNĐ"}
                          </strong>
{", ưu tiên camera chuẩn flagship, hiển thị đỉnh cao và pin bền bỉ cả ngày làm việc, mình đã phân tích thông số từ kho dữ liệu và tuyển chọn "}
                          <span className={"font-semibold text-secondary"}>
{"2 siêu phẩm cao cấp nhất"}
                          </span>
{" dành riêng cho bạn: "}
                        </p>
                        <div className={"grid grid-cols-1 lg:grid-cols-2 gap-4 mt-1"}>
                          <div className={"bg-surface-container-low p-4 rounded-xl flex flex-col justify-between hover:shadow-md transition-all group"}>
                            <div className={"flex flex-col gap-3"}>
                              <div className={"relative w-full h-44 rounded-lg bg-surface-container-lowest overflow-hidden flex items-center justify-center p-2"}>
                                <img className={"w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"} data-alt={"High-end studio product photograph of Samsung Galaxy S24 Ultra in Titanium Gray finish on clean alabaster platform, soft studio rim lighting, 8k commercial presentation"} src={"/images/326bbe12f729abd9.webp"} alt={"High-end studio product photograph of Samsung Galaxy S24 Ultra in Titanium Gray finish on clean alabaster platform, soft studio rim lighting, 8k commercial pres"} />
                                <span className={"absolute top-2 left-2 px-2 py-0.5 rounded bg-on-surface/80 backdrop-blur-md text-inverse-on-surface font-caption text-caption"}>
{"AI Zoom 100x"}
                                </span>
                              </div>
                              <div>
                                <div className={"flex items-center justify-between gap-1"}>
                                  <h4 className={"font-headline-sm text-headline-sm text-on-surface font-semibold group-hover:text-primary transition-colors"}>
{"Samsung Galaxy S24 Ultra"}
                                  </h4>
                                </div>
                                <p className={"font-headline-sm text-headline-sm text-primary font-bold mt-0.5"}>
{"28.490.000₫"}
                                </p>
                              </div>
                              <div className={"flex flex-wrap gap-1.5"}>
                                <span className={"px-2 py-1 rounded-md bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1"}>
                                  <span className={"material-symbols-outlined text-[14px]"}>
{"screenshot"}
                                  </span>
{"6.8\" Dynamic AMOLED 2X "}
                                </span>
                                <span className={"px-2 py-1 rounded-md bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1"}>
                                  <span className={"material-symbols-outlined text-[14px]"}>
{"photo_camera"}
                                  </span>
{"200MP Quad Tele "}
                                </span>
                                <span className={"px-2 py-1 rounded-md bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1"}>
                                  <span className={"material-symbols-outlined text-[14px]"}>
{"battery_charging_full"}
                                  </span>
{"5000 mAh "}
                                </span>
                              </div>
                              <div className={"p-2.5 rounded-lg bg-secondary-fixed/30 text-on-surface font-body-sm text-body-sm leading-snug"}>
                                <span className={"font-semibold text-secondary flex items-center gap-1 mb-0.5"}>
                                  <span className={"material-symbols-outlined text-[15px]"}>
{"psychology"}
                                  </span>
{"Lý do AI gợi ý: "}
                                </span>
{" Màn hình phẳng chống chói Gorilla Armor tối ưu đọc file ngoài trời; Camera tele zoom quang học 5x/10x hàng đầu thị trường. "}
                              </div>
                            </div>
                            <div className={"flex items-center gap-2 mt-4 pt-3 border-t border-surface-container-high"}>
                              <a className={"flex-1 py-2 px-3 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold text-center hover:opacity-90 transition-opacity"} href={"#"}>
{"Xem sản phẩm"}
                              </a>
                              <button className={"px-3 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm flex items-center gap-1"} type={"button"}>
                                <span className={"material-symbols-outlined text-[16px]"}>
{"compare"}
                                </span>
{"So sánh "}
                              </button>
                            </div>
                          </div>
                          <div className={"bg-surface-container-low p-4 rounded-xl flex flex-col justify-between hover:shadow-md transition-all group"}>
                            <div className={"flex flex-col gap-3"}>
                              <div className={"relative w-full h-44 rounded-lg bg-surface-container-lowest overflow-hidden flex items-center justify-center p-2"}>
                                <img className={"w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"} data-alt={"Official commercial product render of Apple iPhone 16 Pro in Natural Titanium finish on minimalist reflective white acrylic surface, subtle purple ambient glow, crisp shadows"} src={"/images/79e5fb8dd866aaef.webp"} alt={"Official commercial product render of Apple iPhone 16 Pro in Natural Titanium finish on minimalist reflective white acrylic surface, subtle purple ambient glow,"} />
                                <span className={"absolute top-2 left-2 px-2 py-0.5 rounded bg-on-surface/80 backdrop-blur-md text-inverse-on-surface font-caption text-caption"}>
{"Apple Intelligence"}
                                </span>
                              </div>
                              <div>
                                <div className={"flex items-center justify-between gap-1"}>
                                  <h4 className={"font-headline-sm text-headline-sm text-on-surface font-semibold group-hover:text-primary transition-colors"}>
{"iPhone 16 Pro 128GB"}
                                  </h4>
                                </div>
                                <p className={"font-headline-sm text-headline-sm text-primary font-bold mt-0.5"}>
{"28.990.000₫"}
                                </p>
                              </div>
                              <div className={"flex flex-wrap gap-1.5"}>
                                <span className={"px-2 py-1 rounded-md bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1"}>
                                  <span className={"material-symbols-outlined text-[14px]"}>
{"screenshot"}
                                  </span>
{"6.3\" Super Retina XDR "}
                                </span>
                                <span className={"px-2 py-1 rounded-md bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1"}>
                                  <span className={"material-symbols-outlined text-[14px]"}>
{"videocam"}
                                  </span>
{"48MP Fusion 4K 120fps "}
                                </span>
                                <span className={"px-2 py-1 rounded-md bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1"}>
                                  <span className={"material-symbols-outlined text-[14px]"}>
{"battery_horiz_075"}
                                  </span>
{"3582 mAh + A18 Pro "}
                                </span>
                              </div>
                              <div className={"p-2.5 rounded-lg bg-secondary-fixed/30 text-on-surface font-body-sm text-body-sm leading-snug"}>
                                <span className={"font-semibold text-secondary flex items-center gap-1 mb-0.5"}>
                                  <span className={"material-symbols-outlined text-[15px]"}>
{"psychology"}
                                  </span>
{"Lý do AI gợi ý: "}
                                </span>
{" Quay video cinematic và chụp ảnh chân dung chân thực nhất; chip A18 Pro cực kỳ tiết kiệm điện và giữ giá vượt trội. "}
                              </div>
                            </div>
                            <div className={"flex items-center gap-2 mt-4 pt-3 border-t border-surface-container-high"}>
                              <a className={"flex-1 py-2 px-3 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold text-center hover:opacity-90 transition-opacity"} href={"#"}>
{"Xem sản phẩm"}
                              </a>
                              <button className={"px-3 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm flex items-center gap-1"} type={"button"}>
                                <span className={"material-symbols-outlined text-[16px]"}>
{"compare"}
                                </span>
{"So sánh "}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={"flex justify-end"}>
                    <div className={"max-w-[85%] md:max-w-[70%] bg-surface-container-high text-on-surface px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-sm"}>
                      <p className={"font-body-md text-body-md leading-relaxed"}>
{" À tiện cho mình hỏi nếu mua máy về dùng thử thì shop có cho đổi trả trong 7 ngày không? Cần điều kiện gì? "}
                      </p>
                      <div className={"flex justify-end items-center gap-1.5 mt-1"}>
                        <span className={"font-caption text-caption text-outline"}>
{"10:44"}
                        </span>
                        <span className={"material-symbols-outlined text-[14px] text-primary"}>
{"done_all"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={"flex gap-3 max-w-[96%] md:max-w-[90%]"}>
                    <div className={"w-9 h-9 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 shadow-sm animate-bounce"}>
                      <span className={"material-symbols-outlined text-[20px]"}>
{"swap_horiz"}
                      </span>
                    </div>
                    <div className={"flex flex-col gap-2 flex-1"}>
                      <div className={"bg-surface-container-lowest p-6 rounded-2xl rounded-tl-sm shadow-xl flex flex-col gap-4 relative overflow-hidden"}>
                        <div className={"absolute inset-0 bg-gradient-to-r from-secondary-fixed/20 via-primary-fixed/20 to-transparent pointer-events-none"}>

                        </div>
                        <div className={"relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2"}>
                          <div className={"flex items-center gap-2"}>
                            <span className={"flex h-2.5 w-2.5 rounded-full bg-secondary"}>

                            </span>
                            <h3 className={"font-headline-sm text-headline-sm text-on-surface font-semibold"}>
{" Bạn có muốn chuyển chủ đề trò chuyện? "}
                            </h3>
                          </div>
                          <span className={"self-start sm:self-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-bold tracking-wide uppercase"}>
{" AI Context Shift "}
                          </span>
                        </div>
                        <p className={"relative z-10 font-body-md text-body-md text-on-surface-variant leading-relaxed"}>
{" Câu hỏi của bạn liên quan đến quy định đổi trả và thuộc chuyên mục "}
                          <strong className={"text-on-surface font-semibold"}>
{"Hỗ trợ cửa hàng"}
                          </strong>
{". Chuyển sang chủ đề này sẽ lập tức kích hoạt bộ cơ sở dữ liệu "}
                          <strong className={"text-secondary font-semibold"}>
{"RAG Store tài liệu nội bộ chính sách bảo hành"}
                          </strong>
{" để đối chiếu chính xác từng điều khoản. "}
                        </p>
                        <div className={"relative z-10 p-3.5 rounded-xl bg-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-3"}>
                          <div className={"flex items-center gap-2"}>
                            <span className={"w-7 h-7 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary text-sm shadow-sm font-semibold"}>
                              <span className={"material-symbols-outlined text-[16px]"}>
{"shopping_bag"}
                              </span>
                            </span>
                            <div>
                              <p className={"font-caption text-caption text-outline"}>
{"Chủ đề gốc"}
                              </p>
                              <p className={"font-label-sm text-label-sm font-semibold text-on-surface"}>
{"Tư vấn mua điện thoại"}
                              </p>
                            </div>
                          </div>
                          <div className={"flex items-center justify-center text-secondary"}>
                            <span className={"material-symbols-outlined text-[24px]"}>
{"trending_flat"}
                            </span>
                          </div>
                          <div className={"flex items-center gap-2"}>
                            <span className={"w-7 h-7 rounded-lg bg-secondary text-on-secondary flex items-center justify-center text-sm shadow-sm font-semibold"}>
                              <span className={"material-symbols-outlined text-[16px]"}>
{"verified_user"}
                              </span>
                            </span>
                            <div>
                              <p className={"font-caption text-caption text-secondary"}>
{"Chủ đề mục tiêu"}
                              </p>
                              <p className={"font-label-sm text-label-sm font-semibold text-secondary"}>
{"Hỗ trợ cửa hàng (RAG)"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className={"relative z-10 flex flex-wrap items-center gap-3 pt-2"}>
                          <button className={"py-2.5 px-5 rounded-xl bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-label-md font-semibold flex items-center gap-2 shadow-md transition-all active:scale-[0.98]"} type={"button"}>
                            <span className={"material-symbols-outlined text-[18px]"}>
{"sync_alt"}
                            </span>
{" Chuyển sang Hỗ trợ cửa hàng & Trả lời ngay "}
                          </button>
                          <button className={"py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium transition-colors"} type={"button"}>
{" Ở lại chủ đề hiện tại "}
                          </button>
                        </div>
                        <div className={"relative z-10 flex items-center gap-2 text-outline"}>
                          <span className={"material-symbols-outlined text-[16px]"}>
{"info"}
                          </span>
                          <span className={"font-caption text-caption"}>
{"Sau khi chuyển, hệ thống sẽ tự động xử lý và trả lời câu hỏi trên mà bạn không cần phải nhập lại."}
                          </span>
                        </div>
                      </div>
                      <div className={"mt-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container text-on-surface-variant font-caption text-caption"}>
                        <span className={"material-symbols-outlined text-[16px] text-secondary"}>
{"menu_book"}
                        </span>
                        <span>
{"Nguồn tham chiếu sẵn sàng: "}
                          <strong className={"text-on-surface"}>
{"Chính sách đổi trả & hoàn tiền SmartPhone AI"}
                          </strong>
{" (Phiên bản v2.4, Mục 3.1)"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <footer className={"p-4 md:px-8 md:pb-6 bg-surface-container-lowest shrink-0 flex flex-col gap-3"}>
                  <div className={"flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5"}>
                    <span className={"font-caption text-caption text-outline font-semibold uppercase shrink-0"}>
{"Gợi ý nhanh:"}
                    </span>
                    <button className={"px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm shrink-0 transition-colors flex items-center gap-1.5"} type={"button"}>
                      <span className={"material-symbols-outlined text-[14px] text-secondary"}>
{"compare_arrows"}
                      </span>
{" So sánh chi tiết 2 máy trên "}
                    </button>
                    <button className={"px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm shrink-0 transition-colors flex items-center gap-1.5"} type={"button"}>
                      <span className={"material-symbols-outlined text-[14px] text-primary"}>
{"verified"}
                      </span>
{" Chính sách bảo hành 12 tháng "}
                    </button>
                    <button className={"px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm shrink-0 transition-colors flex items-center gap-1.5"} type={"button"}>
                      <span className={"material-symbols-outlined text-[14px] text-[#16A34A]"}>
{"local_shipping"}
                      </span>
{" Thời gian giao hàng COD miễn phí "}
                    </button>
                  </div>
                  <div className={"relative bg-surface-container-low rounded-2xl p-2 pl-4 flex items-center gap-2 shadow-inner focus-within:ring-2 focus-within:ring-primary/40 transition-all"}>
                    <span className={"material-symbols-outlined text-outline text-[22px]"}>
{"auto_awesome"}
                    </span>
                    <input className={"w-full bg-transparent border-none outline-none font-body-md text-body-md text-on-surface placeholder:text-outline py-2"} placeholder={"Nhập câu hỏi của bạn cho SmartPhone AI..."} type={"text"} />
                    <div className={"flex items-center gap-1 shrink-0 pr-1"}>
                      <button aria-label={"Nhập bằng giọng nói"} className={"w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"} title={"Ghi âm câu hỏi"} type={"button"}>
                        <span className={"material-symbols-outlined text-[20px]"}>
{"mic"}
                        </span>
                      </button>
                      <button aria-label={"Tối ưu câu lệnh với AI"} className={"w-9 h-9 rounded-full flex items-center justify-center text-secondary hover:bg-secondary-fixed transition-all"} title={"Tối ưu hóa câu hỏi"} type={"button"}>
                        <span className={"material-symbols-outlined text-[20px]"}>
{"magic_button"}
                        </span>
                      </button>
                      <button aria-label={"Gửi tin nhắn"} className={"w-10 h-10 rounded-xl bg-primary hover:bg-primary-container text-on-primary flex items-center justify-center shadow-md transition-all active:scale-95"} type={"button"}>
                        <span className={"material-symbols-outlined text-[20px]"}>
{"send"}
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className={"flex items-center justify-between text-outline px-1"}>
                    <p className={"font-caption text-caption"}>
{"SmartPhone AI có thể mắc lỗi nhỏ. Hãy kiểm tra lại thông tin quan trọng với đại lý cửa hàng."}
                    </p>
                    <div className={"hidden sm:flex items-center gap-1 font-caption text-caption"}>
                      <span className={"inline-block w-1.5 h-1.5 rounded-full bg-[#16A34A]"}>

                      </span>
                      <span>
{"Hệ thống bảo mật 256-bit SSL"}
                      </span>
                    </div>
                  </div>
                </footer>
              </section>
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
