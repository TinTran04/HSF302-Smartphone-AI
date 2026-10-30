// Converted from ch_n_ch_ai_smartphone_ai/code.html. Read-only design reference.
// Inline scripts were replaced by React state in src/pages and src/features.
export default function TopicsDesign() {
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
          <div className={"relative w-full overflow-hidden bg-surface py-space-xl md:py-space-2xl"}>
            <div className={"absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-secondary-fixed/40 via-primary-fixed/20 to-transparent blur-3xl pointer-events-none rounded-full opacity-60"}>

            </div>
            <div className={"absolute top-1/3 -right-48 w-96 h-96 bg-secondary-fixed/30 blur-3xl rounded-full pointer-events-none"}>

            </div>
            <div className={"absolute top-2/3 -left-48 w-96 h-96 bg-primary-fixed/30 blur-3xl rounded-full pointer-events-none"}>

            </div>
            <div className={"relative max-w-[1000px] mx-auto px-margin-mobile md:px-gutter"}>
              <div className={"flex items-center justify-center mb-space-lg"}>
                <div className={"inline-flex items-center gap-space-xs px-3.5 py-1 rounded-full bg-surface-container shadow-sm"}>
                  <span className={"flex h-2 w-2 relative"}>
                    <span className={"animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"}>

                    </span>
                    <span className={"relative inline-flex rounded-full h-2 w-2 bg-secondary"}>

                    </span>
                  </span>
                  <span className={"font-label-sm text-label-sm text-secondary font-semibold uppercase tracking-wider"}>
{"Hệ thống Trí tuệ Nhân tạo Thế hệ Mới"}
                  </span>
                </div>
              </div>
              <section className={"text-center max-w-[760px] mx-auto flex flex-col items-center"}>
                <div className={"relative mb-space-lg group"}>
                  <div className={"absolute -inset-1.5 rounded-full bg-gradient-to-tr from-primary to-secondary blur-sm opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse"}>

                  </div>
                  <div className={"relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-surface-container-lowest p-1 shadow-md flex items-center justify-center"}>
                    <div className={"w-full h-full rounded-full bg-gradient-to-br from-primary via-primary-container to-secondary flex items-center justify-center text-on-primary"}>
                      <span className={"material-symbols-outlined text-[36px] md:text-[44px]"} style={{"fontVariationSettings":"'FILL' 1"}}>
{"auto_awesome"}
                      </span>
                    </div>
                  </div>
                  <div className={"absolute -bottom-1 -right-1 bg-surface-container-lowest p-0.5 rounded-full shadow-sm"}>
                    <span className={"material-symbols-outlined text-secondary text-[20px] bg-secondary-fixed p-1 rounded-full"}>
{"smart_toy"}
                    </span>
                  </div>
                </div>
                <h1 className={"font-headline-lg text-headline-lg md:text-display-hero text-on-surface tracking-tight font-bold mb-space-sm"}>
{" Xin chào! Mình có thể giúp gì cho bạn hôm nay? "}
                </h1>
                <p className={"font-body-lg text-body-lg text-on-surface-variant max-w-[620px] mx-auto leading-relaxed"}>
{" Hãy chọn nhu cầu của bạn để SmartPhone AI kích hoạt ngữ cảnh hỗ trợ chính xác nhất. "}
                </p>
              </section>
              <section className={"mt-space-xl grid grid-cols-1 md:grid-cols-2 gap-space-lg"}>
                <div className={"group relative bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"}>
                  <div className={"absolute top-0 right-0 w-32 h-32 bg-secondary-fixed/20 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500"}>

                  </div>
                  <div>
                    <div className={"flex items-center justify-between mb-space-md"}>
                      <div className={"w-14 h-14 rounded-xl bg-gradient-to-tr from-secondary-fixed to-primary-fixed flex items-center justify-center text-secondary shadow-sm group-hover:bg-secondary group-hover:text-on-secondary transition-colors duration-300"}>
                        <span className={"material-symbols-outlined text-[30px]"} style={{"fontVariationSettings":"'FILL' 1"}}>
{"phone_iphone"}
                        </span>
                      </div>
                      <span className={"font-caption text-caption uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant"}>
{"Chủ đề 01"}
                      </span>
                    </div>
                    <h2 className={"font-headline-sm text-headline-sm text-on-surface group-hover:text-secondary transition-colors mb-space-xs font-semibold"}>
{" Tư vấn mua điện thoại "}
                    </h2>
                    <p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-md"}>
{" Tìm chiếc điện thoại phù hợp với ngân sách, sở thích chụp ảnh, chơi game hoặc nhu cầu công việc hàng ngày của bạn. "}
                    </p>
                    <div className={"mb-space-lg"}>
                      <span className={"font-label-sm text-label-sm text-outline block mb-2 font-medium"}>
{"Gợi ý câu hỏi phổ biến:"}
                      </span>
                      <div className={"flex flex-wrap gap-2"}>
                        <button className={"text-left font-body-sm text-body-sm px-3 py-1.5 rounded-full bg-surface-container hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-colors text-on-surface-variant"} type={"button"}>
{" Dưới 10 triệu máy nào ngon? "}
                        </button>
                        <button className={"text-left font-body-sm text-body-sm px-3 py-1.5 rounded-full bg-surface-container hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-colors text-on-surface-variant"} type={"button"}>
{" Điện thoại chụp ảnh chân dung đẹp "}
                        </button>
                        <button className={"text-left font-body-sm text-body-sm px-3 py-1.5 rounded-full bg-surface-container hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-colors text-on-surface-variant"} type={"button"}>
{" Pin trâu dùng 2 ngày "}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className={"pt-space-sm"}>
                    <a className={"w-full inline-flex items-center justify-between px-space-md py-3 rounded-lg bg-surface-container hover:bg-secondary hover:text-on-secondary text-on-surface font-label-md text-label-md font-semibold transition-all duration-200 group-hover:bg-secondary group-hover:text-on-secondary shadow-sm"} data-path={"tro-ly-ai-va-xac-nhan-chuyen-chu-de"} href={"#"}>
                      <span>
{"Nhận tư vấn ngay"}
                      </span>
                      <span className={"material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:translate-x-1"}>
{"arrow_forward"}
                      </span>
                    </a>
                  </div>
                </div>
                <div className={"group relative bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"}>
                  <div className={"absolute top-0 right-0 w-32 h-32 bg-primary-fixed/20 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500"}>

                  </div>
                  <div>
                    <div className={"flex items-center justify-between mb-space-md"}>
                      <div className={"w-14 h-14 rounded-xl bg-gradient-to-tr from-primary-fixed to-secondary-fixed flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300"}>
                        <span className={"material-symbols-outlined text-[30px]"} style={{"fontVariationSettings":"'FILL' 1"}}>
{"compare_arrows"}
                        </span>
                      </div>
                      <span className={"font-caption text-caption uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant"}>
{"Chủ đề 02"}
                      </span>
                    </div>
                    <h2 className={"font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors mb-space-xs font-semibold"}>
{" So sánh điện thoại "}
                    </h2>
                    <p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-md"}>
{" So sánh cấu hình, camera, chip xử lý, thời lượng pin giữa các dòng máy và nhận phân tích ưu nhược điểm từ AI. "}
                    </p>
                    <div className={"mb-space-lg"}>
                      <span className={"font-label-sm text-label-sm text-outline block mb-2 font-medium"}>
{"Gợi ý so sánh nhanh:"}
                      </span>
                      <div className={"flex flex-wrap gap-2"}>
                        <button className={"text-left font-body-sm text-body-sm px-3 py-1.5 rounded-full bg-surface-container hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors text-on-surface-variant"} type={"button"}>
{" iPhone 16 Pro Max vs S24 Ultra "}
                        </button>
                        <button className={"text-left font-body-sm text-body-sm px-3 py-1.5 rounded-full bg-surface-container hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors text-on-surface-variant"} type={"button"}>
{" Xiaomi 14 vs OPPO Find X7 "}
                        </button>
                        <button className={"text-left font-body-sm text-body-sm px-3 py-1.5 rounded-full bg-surface-container hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors text-on-surface-variant"} type={"button"}>
{" So sánh camera tele 5x "}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className={"pt-space-sm"}>
                    <a className={"w-full inline-flex items-center justify-between px-space-md py-3 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-label-md font-semibold transition-all duration-200 group-hover:bg-primary group-hover:text-on-primary shadow-sm"} data-path={"tro-ly-ai-va-xac-nhan-chuyen-chu-de"} href={"#"}>
                      <span>
{"Bắt đầu so sánh"}
                      </span>
                      <span className={"material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:translate-x-1"}>
{"arrow_forward"}
                      </span>
                    </a>
                  </div>
                </div>
                <div className={"group relative bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"}>
                  <div className={"absolute top-0 right-0 w-32 h-32 bg-[#DCFCE7] rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500"}>

                  </div>
                  <div>
                    <div className={"flex items-center justify-between mb-space-md"}>
                      <div className={"w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-tertiary shadow-sm group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors duration-300"}>
                        <span className={"material-symbols-outlined text-[30px]"} style={{"fontVariationSettings":"'FILL' 1"}}>
{"verified_user"}
                        </span>
                      </div>
                      <div className={"flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0FDF4] text-[#16A34A] font-caption text-caption font-semibold"}>
                        <span className={"material-symbols-outlined text-[14px]"}>
{"bolt"}
                        </span>
                        <span>
{"RAG Verified"}
                        </span>
                      </div>
                    </div>
                    <h2 className={"font-headline-sm text-headline-sm text-on-surface group-hover:text-tertiary transition-colors mb-space-xs font-semibold"}>
{" Hỗ trợ cửa hàng "}
                    </h2>
                    <p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-md"}>
{" Giải đáp chính sách bảo hành 12 tháng, điều kiện đổi trả 7 ngày, quy trình giao hàng COD và các thắc mắc về cửa hàng. "}
                    </p>
                    <div className={"mb-space-lg"}>
                      <span className={"font-label-sm text-label-sm text-outline block mb-2 font-medium"}>
{"Chính sách tra cứu nhanh:"}
                      </span>
                      <div className={"flex flex-wrap gap-2"}>
                        <button className={"text-left font-body-sm text-body-sm px-3 py-1.5 rounded-full bg-surface-container hover:bg-tertiary-fixed hover:text-on-tertiary-fixed transition-colors text-on-surface-variant"} type={"button"}>
{" Chính sách đổi trả 7 ngày "}
                        </button>
                        <button className={"text-left font-body-sm text-body-sm px-3 py-1.5 rounded-full bg-surface-container hover:bg-tertiary-fixed hover:text-on-tertiary-fixed transition-colors text-on-surface-variant"} type={"button"}>
{" Quy trình nhận hàng COD "}
                        </button>
                        <button className={"text-left font-body-sm text-body-sm px-3 py-1.5 rounded-full bg-surface-container hover:bg-tertiary-fixed hover:text-on-tertiary-fixed transition-colors text-on-surface-variant"} type={"button"}>
{" Bảo hành rơi vỡ màn hình "}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className={"pt-space-sm"}>
                    <a className={"w-full inline-flex items-center justify-between px-space-md py-3 rounded-lg bg-surface-container hover:bg-tertiary hover:text-on-tertiary text-on-surface font-label-md text-label-md font-semibold transition-all duration-200 group-hover:bg-tertiary group-hover:text-on-tertiary shadow-sm"} data-path={"tro-ly-ai-va-xac-nhan-chuyen-chu-de"} href={"#"}>
                      <span>
{"Nhận hỗ trợ chính sách"}
                      </span>
                      <span className={"material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:translate-x-1"}>
{"arrow_forward"}
                      </span>
                    </a>
                  </div>
                </div>
                <div className={"group relative bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"}>
                  <div className={"absolute top-0 right-0 w-32 h-32 bg-secondary-fixed/30 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500"}>

                  </div>
                  <div>
                    <div className={"flex items-center justify-between mb-space-md"}>
                      <div className={"w-14 h-14 rounded-xl bg-gradient-to-br from-secondary-container to-secondary flex items-center justify-center text-on-secondary shadow-sm"}>
                        <span className={"material-symbols-outlined text-[30px]"} style={{"fontVariationSettings":"'FILL' 1"}}>
{"psychology"}
                        </span>
                      </div>
                      <span className={"font-caption text-caption uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed"}>
{"Mở Rộng"}
                      </span>
                    </div>
                    <h2 className={"font-headline-sm text-headline-sm text-on-surface group-hover:text-secondary transition-colors mb-space-xs font-semibold"}>
{" Trò chuyện cùng AI "}
                    </h2>
                    <p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-md"}>
{" Trò chuyện tự do và giải đáp các câu hỏi kiến thức công nghệ, thuật ngữ chip, màn hình OLED, cảm biến máy ảnh. "}
                    </p>
                    <div className={"mb-space-lg"}>
                      <span className={"font-label-sm text-label-sm text-outline block mb-2 font-medium"}>
{"Khám phá công nghệ:"}
                      </span>
                      <div className={"flex flex-wrap gap-2"}>
                        <button className={"text-left font-body-sm text-body-sm px-3 py-1.5 rounded-full bg-surface-container hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-colors text-on-surface-variant"} type={"button"}>
{" Màn hình LTPO là gì? "}
                        </button>
                        <button className={"text-left font-body-sm text-body-sm px-3 py-1.5 rounded-full bg-surface-container hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-colors text-on-surface-variant"} type={"button"}>
{" RAM LPDDR5X có tác dụng gì? "}
                        </button>
                        <button className={"text-left font-body-sm text-body-sm px-3 py-1.5 rounded-full bg-surface-container hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-colors text-on-surface-variant"} type={"button"}>
{" Ý nghĩa chuẩn IP68 "}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className={"pt-space-sm"}>
                    <a className={"w-full inline-flex items-center justify-between px-space-md py-3 rounded-lg bg-surface-container hover:bg-secondary hover:text-on-secondary text-on-surface font-label-md text-label-md font-semibold transition-all duration-200 group-hover:bg-secondary group-hover:text-on-secondary shadow-sm"} data-path={"tro-ly-ai-va-xac-nhan-chuyen-chu-de"} href={"#"}>
                      <span>
{"Trò chuyện ngay"}
                      </span>
                      <span className={"material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:translate-x-1"}>
{"arrow_forward"}
                      </span>
                    </a>
                  </div>
                </div>
              </section>
              <section className={"mt-space-xl max-w-[800px] mx-auto"}>
                <div className={"bg-surface-container-lowest rounded-xl p-space-sm md:p-space-md shadow-md flex flex-col sm:flex-row items-center gap-space-sm"}>
                  <div className={"flex items-center gap-space-sm pl-space-sm w-full sm:w-auto flex-1"}>
                    <span className={"material-symbols-outlined text-secondary text-[22px]"}>
{"auto_awesome"}
                    </span>
                    <input className={"w-full bg-transparent border-0 outline-none font-body-md text-body-md text-on-surface placeholder:text-outline py-2"} id={"direct-prompt-input"} placeholder={"Hoặc nhập câu hỏi bất kỳ để AI tự động phân loại chủ đề..."} type={"text"} />
                  </div>
                  <a className={"w-full sm:w-auto inline-flex items-center justify-center gap-2 px-space-lg py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-all shadow-sm"} data-path={"tro-ly-ai-va-xac-nhan-chuyen-chu-de"} href={"#"}>
                    <span>
{"Bắt đầu"}
                    </span>
                    <span className={"material-symbols-outlined text-[18px]"}>
{"send"}
                    </span>
                  </a>
                </div>
              </section>
              <footer className={"mt-space-xl pt-space-lg text-center flex flex-col items-center gap-space-sm max-w-[700px] mx-auto"}>
                <div className={"inline-flex items-center gap-space-xs px-space-md py-2 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed font-body-sm text-body-sm shadow-sm"}>
                  <span className={"material-symbols-outlined text-[18px] text-secondary"}>
{"lightbulb"}
                  </span>
                  <span>
{"Bạn luôn có thể đổi chủ đề bất cứ lúc nào trong không gian trò chuyện hoặc để AI tự động nhận diện."}
                  </span>
                </div>
                <p className={"font-caption text-caption text-outline leading-relaxed mt-space-xs"}>
{" Dữ liệu tư vấn được cá nhân hóa khách quan dựa trên thông số kỹ thuật thực tế và chính sách cửa hàng. Không chèn quảng cáo thiên vị. "}
                </p>
                <div className={"flex flex-wrap items-center justify-center gap-space-md pt-space-xs font-label-sm text-label-sm text-on-surface-variant"}>
                  <span className={"inline-flex items-center gap-1"}>
                    <span className={"material-symbols-outlined text-[16px] text-[#16A34A]"}>
{"verified"}
                    </span>
{" 100% Thông số kỹ thuật từ nhà sản xuất "}
                  </span>
                  <span className={"text-surface-dim"}>
{"•"}
                  </span>
                  <span className={"inline-flex items-center gap-1"}>
                    <span className={"material-symbols-outlined text-[16px] text-primary"}>
{"security"}
                    </span>
{" Chính sách bảo mật chuẩn SSL "}
                  </span>
                  <span className={"text-surface-dim"}>
{"•"}
                  </span>
                  <span className={"inline-flex items-center gap-1"}>
                    <span className={"material-symbols-outlined text-[16px] text-secondary"}>
{"update"}
                    </span>
{" Cập nhật giá theo thời gian thực "}
                  </span>
                </div>
              </footer>
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
