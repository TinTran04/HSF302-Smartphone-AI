// Converted from trang_ch_smartphone_ai/code.html. Read-only design reference.
// Inline scripts were replaced by React state in src/pages and src/features.
export default function HomeDesign() {
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
          <section className={"relative w-full overflow-hidden bg-gradient-to-b from-surface via-surface-container-low to-surface pt-12 pb-20"}>
            <div className={"absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-secondary-fixed/30 rounded-full blur-[120px] pointer-events-none"}>

            </div>
            <div className={"absolute top-1/3 right-10 w-[350px] h-[350px] bg-primary-fixed/40 rounded-full blur-[100px] pointer-events-none"}>

            </div>
            <div className={"max-w-[1240px] mx-auto px-gutter relative z-10"}>
              <div className={"flex flex-col items-center text-center max-w-[880px] mx-auto"}>
                <div className={"inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest shadow-sm mb-6"}>
                  <span className={"inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary text-on-secondary"}>
                    <span className={"material-symbols-outlined text-[14px]"}>
{"auto_awesome"}
                    </span>
                  </span>
                  <span className={"font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold"}>
{" Thế hệ mua sắm Smartphone mới "}
                  </span>
                  <span className={"w-1.5 h-1.5 rounded-full bg-secondary"}>

                  </span>
                  <span className={"font-label-sm text-label-sm text-secondary font-semibold"}>
{"RAG 2.0"}
                  </span>
                </div>
                <h1 className={"font-display-hero text-display-hero text-on-surface tracking-tight mb-6"}>
{" Công nghệ bạn yêu. "}
                  <br />
                  <span className={"bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent"}>
{"Lựa chọn thông minh hơn."}
                  </span>
                </h1>
                <p className={"font-body-lg text-body-lg text-on-surface-variant max-w-[700px] mb-10 leading-relaxed"}>
{" Khám phá điện thoại mới nhất và tìm chiếc máy phù hợp với bạn cùng trợ lý AI thông minh tích hợp công nghệ RAG độc quyền từ dữ liệu chính hãng. "}
                </p>
                <div className={"flex flex-wrap items-center justify-center gap-space-md mb-16"}>
                  <a className={"inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container shadow-sm hover:shadow-md transition-all group"} data-path={"chi-tiet-san-pham"} href={"#"}>
{" Khám phá điện thoại "}
                    <span className={"material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform"}>
{"arrow_forward"}
                    </span>
                  </a>
                  <a className={"inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-surface-container-lowest text-secondary font-label-md text-label-md font-semibold shadow-sm hover:shadow-md hover:bg-secondary-fixed/20 transition-all"} data-path={"chon-chu-de-ai"} href={"#"}>
                    <span className={"material-symbols-outlined text-[18px] text-secondary"}>
{"auto_awesome"}
                    </span>
{" Tư vấn cùng AI ✨ "}
                  </a>
                </div>
              </div>
              <div className={"relative w-full max-w-[1100px] mx-auto mt-2"}>
                <div className={"relative w-full h-[460px] md:h-[540px] rounded-3xl bg-surface-container-lowest shadow-xl flex items-center justify-center overflow-hidden"}>
                  <div className={"absolute inset-0 bg-gradient-to-tr from-surface-container-low/60 via-transparent to-secondary-fixed/20"}>

                  </div>
                  <img className={"w-full h-full object-cover object-center relative z-10 transition-transform duration-700 hover:scale-[1.02]"} data-alt={"Photorealistic flagship studio render showcasing Titanium Natural iPhone 16 Pro Max and Samsung Galaxy S24 Ultra side by side on pristine white minimalist platform, soft diffuse lighting, studio shadows, 8k resolution, elegant modern luxury consumer technology retail display"} src={"/images/ec1933ac81872449.webp"} alt={"Photorealistic flagship studio render showcasing Titanium Natural iPhone 16 Pro Max and Samsung Galaxy S24 Ultra side by side on pristine white minimalist platf"} />
                  <div className={"absolute top-8 left-8 z-20 hidden md:flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-container-lowest/90 backdrop-blur-md shadow-md hover:-translate-y-0.5 transition-transform"}>
                    <div className={"w-9 h-9 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed"}>
                      <span className={"material-symbols-outlined text-[20px]"}>
{"smart_toy"}
                      </span>
                    </div>
                    <div className={"text-left"}>
                      <p className={"font-caption text-caption text-on-surface-variant uppercase tracking-wider"}>
{"Khả năng máy"}
                      </p>
                      <p className={"font-label-md text-label-md text-on-surface font-semibold"}>
{"AI Photo Assist"}
                      </p>
                    </div>
                  </div>
                  <div className={"absolute top-1/2 -translate-y-1/2 right-8 z-20 hidden md:flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-container-lowest/90 backdrop-blur-md shadow-md hover:-translate-y-0.5 transition-transform"}>
                    <div className={"w-9 h-9 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed"}>
                      <span className={"material-symbols-outlined text-[20px]"}>
{"memory"}
                      </span>
                    </div>
                    <div className={"text-left"}>
                      <p className={"font-caption text-caption text-on-surface-variant uppercase tracking-wider"}>
{"Hiệu năng chuẩn"}
                      </p>
                      <p className={"font-label-md text-label-md text-on-surface font-semibold"}>
{"Chip 3nm mạnh mẽ"}
                      </p>
                    </div>
                  </div>
                  <div className={"absolute bottom-8 left-12 z-20 hidden md:flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-container-lowest/90 backdrop-blur-md shadow-md hover:-translate-y-0.5 transition-transform"}>
                    <div className={"w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-primary"}>
                      <span className={"material-symbols-outlined text-[20px]"}>
{"battery_charging_full"}
                      </span>
                    </div>
                    <div className={"text-left"}>
                      <p className={"font-caption text-caption text-on-surface-variant uppercase tracking-wider"}>
{"Thời lượng thực"}
                      </p>
                      <p className={"font-label-md text-label-md text-on-surface font-semibold"}>
{"Pin 54 tiếng liên tục"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className={"w-full bg-surface-container-lowest py-8 shadow-sm relative z-20"}>
            <div className={"max-w-[1240px] mx-auto px-gutter"}>
              <div className={"flex items-center justify-between gap-4 overflow-x-auto no-scrollbar py-2"}>
                <a className={"flex-1 min-w-[190px] flex items-center justify-between p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all group"} href={"#"}>
                  <div className={"flex items-center gap-3"}>
                    <div className={"w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center text-on-surface shadow-xs"}>
                      <span className={"material-symbols-outlined text-[22px]"}>
{"phone_iphone"}
                      </span>
                    </div>
                    <div>
                      <p className={"font-label-md text-label-md text-on-surface font-bold group-hover:text-primary transition-colors"}>
{"Apple"}
                      </p>
                      <p className={"font-caption text-caption text-on-surface-variant"}>
{"iPhone 16 Series"}
                      </p>
                    </div>
                  </div>
                  <span className={"font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container-lowest text-on-surface-variant font-medium"}>
{"18 máy"}
                  </span>
                </a>
                <a className={"flex-1 min-w-[190px] flex items-center justify-between p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all group"} href={"#"}>
                  <div className={"flex items-center gap-3"}>
                    <div className={"w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-xs"}>
                      <span className={"material-symbols-outlined text-[22px]"}>
{"ad_units"}
                      </span>
                    </div>
                    <div>
                      <p className={"font-label-md text-label-md text-on-surface font-bold group-hover:text-primary transition-colors"}>
{"Samsung"}
                      </p>
                      <p className={"font-caption text-caption text-on-surface-variant"}>
{"Galaxy S24 | Z Fold"}
                      </p>
                    </div>
                  </div>
                  <span className={"font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container-lowest text-on-surface-variant font-medium"}>
{"24 máy"}
                  </span>
                </a>
                <a className={"flex-1 min-w-[190px] flex items-center justify-between p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all group"} href={"#"}>
                  <div className={"flex items-center gap-3"}>
                    <div className={"w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center text-tertiary-container shadow-xs"}>
                      <span className={"material-symbols-outlined text-[22px]"}>
{"smartphone"}
                      </span>
                    </div>
                    <div>
                      <p className={"font-label-md text-label-md text-on-surface font-bold group-hover:text-primary transition-colors"}>
{"Xiaomi"}
                      </p>
                      <p className={"font-caption text-caption text-on-surface-variant"}>
{"Xiaomi 14 Series"}
                      </p>
                    </div>
                  </div>
                  <span className={"font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container-lowest text-on-surface-variant font-medium"}>
{"16 máy"}
                  </span>
                </a>
                <a className={"flex-1 min-w-[190px] flex items-center justify-between p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all group"} href={"#"}>
                  <div className={"flex items-center gap-3"}>
                    <div className={"w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center text-[#16A34A] shadow-xs"}>
                      <span className={"material-symbols-outlined text-[22px]"}>
{"photo_camera"}
                      </span>
                    </div>
                    <div>
                      <p className={"font-label-md text-label-md text-on-surface font-bold group-hover:text-primary transition-colors"}>
{"OPPO"}
                      </p>
                      <p className={"font-caption text-caption text-on-surface-variant"}>
{"Find X | Reno 12"}
                      </p>
                    </div>
                  </div>
                  <span className={"font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container-lowest text-on-surface-variant font-medium"}>
{"12 máy"}
                  </span>
                </a>
                <a className={"flex-1 min-w-[190px] flex items-center justify-between p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all group"} href={"#"}>
                  <div className={"flex items-center gap-3"}>
                    <div className={"w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center text-secondary shadow-xs"}>
                      <span className={"material-symbols-outlined text-[22px]"}>
{"flare"}
                      </span>
                    </div>
                    <div>
                      <p className={"font-label-md text-label-md text-on-surface font-bold group-hover:text-primary transition-colors"}>
{"vivo"}
                      </p>
                      <p className={"font-caption text-caption text-on-surface-variant"}>
{"X100 Series ZEISS"}
                      </p>
                    </div>
                  </div>
                  <span className={"font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container-lowest text-on-surface-variant font-medium"}>
{"9 máy"}
                  </span>
                </a>
              </div>
            </div>
          </section>
          <section className={"w-full py-24 bg-surface relative"}>
            <div className={"max-w-[1240px] mx-auto px-gutter"}>
              <div className={"rounded-3xl bg-surface-container-low p-8 md:p-12 mb-12 shadow-sm relative overflow-hidden"}>
                <div className={"absolute -right-16 -top-16 w-80 h-80 rounded-full bg-secondary-fixed/40 blur-3xl pointer-events-none"}>

                </div>
                <div className={"relative z-10 max-w-[760px]"}>
                  <div className={"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption uppercase tracking-wider font-semibold mb-4"}>
                    <span className={"material-symbols-outlined text-[14px]"}>
{"psychology"}
                    </span>
{" Công nghệ cốt lõi "}
                  </div>
                  <h2 className={"font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight mb-4"}>
{" Chưa biết chọn điện thoại nào? Hãy để AI giúp bạn. "}
                  </h2>
                  <p className={"font-body-lg text-body-lg text-on-surface-variant leading-relaxed"}>
{" Trợ lý thông minh đồng hành xuyên suốt hành trình mua sắm từ khám phá cấu hình đến tra cứu chính sách, mang lại quyết định chính xác nhất theo cách dễ hiểu nhất. "}
                  </p>
                </div>
              </div>
              <div className={"grid grid-cols-1 md:grid-cols-2 gap-space-lg"}>
                <div className={"group relative rounded-3xl bg-surface-container-lowest p-8 md:p-10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"}>
                  <div>
                    <div className={"w-14 h-14 rounded-2xl bg-secondary-fixed flex items-center justify-center text-secondary mb-6 group-hover:scale-105 transition-transform"}>
                      <span className={"material-symbols-outlined text-[28px]"}>
{"phone_android"}
                      </span>
                    </div>
                    <div className={"flex items-center gap-2 mb-2"}>
                      <span className={"font-caption text-caption text-secondary uppercase font-semibold tracking-wider"}>
{"Module 01"}
                      </span>
                      <span className={"w-1 h-1 rounded-full bg-outline-variant"}>

                      </span>
                      <span className={"font-caption text-caption text-on-surface-variant"}>
{"Cá nhân hoá"}
                      </span>
                    </div>
                    <h3 className={"font-headline-sm text-headline-sm text-on-surface font-semibold mb-3"}>
{"Tư vấn mua điện thoại"}
                    </h3>
                    <p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed mb-8"}>
{" Tìm chiếc máy phù hợp ngân sách, sở thích chụp ảnh chân dung, quay phim 4K hay hiệu năng gaming đồ họa cao chỉ sau 3 câu hỏi nhanh. "}
                    </p>
                  </div>
                  <div>
                    <a className={"inline-flex items-center gap-2 font-label-md text-label-md text-secondary font-semibold hover:gap-3 transition-all"} data-path={"chon-chu-de-ai"} href={"#"}>
{" Nhận tư vấn ngay "}
                      <span className={"material-symbols-outlined text-[18px]"}>
{"arrow_forward"}
                      </span>
                    </a>
                  </div>
                </div>
                <div className={"group relative rounded-3xl bg-surface-container-lowest p-8 md:p-10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"}>
                  <div>
                    <div className={"w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary mb-6 group-hover:scale-105 transition-transform"}>
                      <span className={"material-symbols-outlined text-[28px]"}>
{"balance"}
                      </span>
                    </div>
                    <div className={"flex items-center gap-2 mb-2"}>
                      <span className={"font-caption text-caption text-primary uppercase font-semibold tracking-wider"}>
{"Module 02"}
                      </span>
                      <span className={"w-1 h-1 rounded-full bg-outline-variant"}>

                      </span>
                      <span className={"font-caption text-caption text-on-surface-variant"}>
{"Phân tích sâu"}
                      </span>
                    </div>
                    <h3 className={"font-headline-sm text-headline-sm text-on-surface font-semibold mb-3"}>
{"So sánh điện thoại"}
                    </h3>
                    <p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed mb-8"}>
{" Đặt 2-3 mẫu máy cạnh nhau, AI bóc tách điểm khác biệt cốt lõi: thời lượng pin thực tế, dải nhạy sáng camera, và độ bền vật liệu. "}
                    </p>
                  </div>
                  <div>
                    <a className={"inline-flex items-center gap-2 font-label-md text-label-md text-primary font-semibold hover:gap-3 transition-all"} data-path={"chi-tiet-san-pham"} href={"#"}>
{" Bắt đầu so sánh "}
                      <span className={"material-symbols-outlined text-[18px]"}>
{"arrow_forward"}
                      </span>
                    </a>
                  </div>
                </div>
                <div className={"group relative rounded-3xl bg-surface-container-lowest p-8 md:p-10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"}>
                  <div>
                    <div className={"w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface mb-6 group-hover:scale-105 transition-transform"}>
                      <span className={"material-symbols-outlined text-[28px]"}>
{"support_agent"}
                      </span>
                    </div>
                    <div className={"flex items-center gap-2 mb-2"}>
                      <span className={"font-caption text-caption text-on-surface uppercase font-semibold tracking-wider"}>
{"Module 03"}
                      </span>
                      <span className={"w-1 h-1 rounded-full bg-outline-variant"}>

                      </span>
                      <span className={"font-caption text-caption text-on-surface-variant"}>
{"Minh bạch 100%"}
                      </span>
                    </div>
                    <h3 className={"font-headline-sm text-headline-sm text-on-surface font-semibold mb-3"}>
{"Hỗ trợ cửa hàng & RAG"}
                    </h3>
                    <p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed mb-8"}>
{" Giải đáp chính sách bảo hành 12 tháng, đổi mới 7 ngày, quy trình kiểm hàng COD trước khi nhận bằng cơ sở dữ liệu đã được kiểm chứng. "}
                    </p>
                  </div>
                  <div>
                    <a className={"inline-flex items-center gap-2 font-label-md text-label-md text-on-surface font-semibold hover:gap-3 transition-all"} data-path={"chon-chu-de-ai"} href={"#"}>
{" Hỏi chính sách "}
                      <span className={"material-symbols-outlined text-[18px]"}>
{"arrow_forward"}
                      </span>
                    </a>
                  </div>
                </div>
                <div className={"group relative rounded-3xl bg-surface-container-lowest p-8 md:p-10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"}>
                  <div>
                    <div className={"w-14 h-14 rounded-2xl bg-secondary-fixed-dim/40 flex items-center justify-center text-secondary mb-6 group-hover:scale-105 transition-transform"}>
                      <span className={"material-symbols-outlined text-[28px]"}>
{"auto_awesome"}
                      </span>
                    </div>
                    <div className={"flex items-center gap-2 mb-2"}>
                      <span className={"font-caption text-caption text-secondary uppercase font-semibold tracking-wider"}>
{"Module 04"}
                      </span>
                      <span className={"w-1 h-1 rounded-full bg-outline-variant"}>

                      </span>
                      <span className={"font-caption text-caption text-on-surface-variant"}>
{"Tương tác tự nhiên"}
                      </span>
                    </div>
                    <h3 className={"font-headline-sm text-headline-sm text-on-surface font-semibold mb-3"}>
{"Trò chuyện cùng AI"}
                    </h3>
                    <p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed mb-8"}>
{" Giải thích thông số RAM LPDDR5X, chip xử lý tiến trình 3nm, tần số quét thích ứng LTPO bằng ngôn ngữ đời thường, không thuật ngữ khó hiểu. "}
                    </p>
                  </div>
                  <div>
                    <a className={"inline-flex items-center gap-2 font-label-md text-label-md text-secondary font-semibold hover:gap-3 transition-all"} data-path={"chon-chu-de-ai"} href={"#"}>
{" Trò chuyện ngay "}
                      <span className={"material-symbols-outlined text-[18px]"}>
{"arrow_forward"}
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className={"w-full py-20 bg-surface-container-low"}>
            <div className={"max-w-[1240px] mx-auto px-gutter"}>
              <div className={"flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"}>
                <div>
                  <span className={"font-caption text-caption text-primary uppercase font-bold tracking-widest"}>
{"Bộ sưu tập tuyển chọn"}
                  </span>
                  <h2 className={"font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight mt-1"}>
{"Sản phẩm được quan tâm nhất"}
                  </h2>
                </div>
                <div className={"flex items-center gap-2 overflow-x-auto no-scrollbar p-1 rounded-full bg-surface-container-lowest shadow-xs"}>
                  <button className={"px-5 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md font-semibold transition-all shadow-xs"} type={"button"}>
{" Tất cả "}
                  </button>
                  <button className={"px-5 py-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md font-medium transition-all"} type={"button"}>
{" Flagship AI "}
                  </button>
                  <button className={"px-5 py-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md font-medium transition-all"} type={"button"}>
{" Chụp ảnh đỉnh cao "}
                  </button>
                  <button className={"px-5 py-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md font-medium transition-all"} type={"button"}>
{" Gaming & Pin trâu "}
                  </button>
                </div>
              </div>
              <div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg"}>
                <div className={"rounded-3xl bg-surface-container-lowest p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"}>
                  <div>
                    <div className={"relative w-full h-64 rounded-2xl bg-surface-container-low flex items-center justify-center p-4 mb-6 overflow-hidden"}>
                      <img className={"w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"} data-alt={"Apple iPhone 16 Pro Max Natural Titanium front and sleek back studio shot, razor sharp minimalist framing, pure white lighting, studio reflection"} src={"/images/dc9d9387a95e4c97.webp"} alt={"Apple iPhone 16 Pro Max Natural Titanium front and sleek back studio shot, razor sharp minimalist framing, pure white lighting, studio reflection"} />
                      <span className={"absolute top-3 left-3 px-2.5 py-1 rounded-full bg-surface-container-lowest text-secondary font-caption text-caption font-semibold shadow-xs"}>
{" AI Vision "}
                      </span>
                    </div>
                    <div className={"flex items-center gap-1.5 mb-2"}>
                      <span className={"w-2 h-2 rounded-full bg-[#16A34A]"}>

                      </span>
                      <span className={"font-caption text-caption text-on-surface-variant"}>
{"Titanium tự nhiên"}
                      </span>
                    </div>
                    <h3 className={"font-headline-sm text-headline-sm text-on-surface font-semibold mb-1 group-hover:text-primary transition-colors"}>
{"iPhone 16 Pro Max"}
                    </h3>
                    <p className={"font-body-sm text-body-sm text-on-surface-variant mb-4"}>
{"Apple Intelligence, Màn hình 6.9\" OLED, Chip A18 Pro 3nm"}
                    </p>
                  </div>
                  <div>
                    <div className={"pt-4 border-t-0 bg-surface-container-low/40 -mx-6 -mb-6 p-6 rounded-b-3xl"}>
                      <p className={"font-caption text-caption text-on-surface-variant"}>
{"Giá ưu đãi từ"}
                      </p>
                      <p className={"font-headline-sm text-headline-sm text-primary font-bold mb-4"}>
{"34.990.000₫"}
                      </p>
                      <div className={"flex items-center gap-2"}>
                        <a className={"flex-1 py-2.5 px-3 rounded-xl bg-primary text-on-primary text-center font-label-md text-label-md font-semibold hover:bg-primary-container transition-all"} data-path={"chi-tiet-san-pham"} href={"#"}>
{" Xem chi tiết "}
                        </a>
                        <button aria-label={"So sánh iPhone 16 Pro Max"} className={"p-2.5 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"} title={"So sánh"} type={"button"}>
                          <span className={"material-symbols-outlined text-[20px]"}>
{"balance"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={"rounded-3xl bg-surface-container-lowest p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"}>
                  <div>
                    <div className={"relative w-full h-64 rounded-2xl bg-surface-container-low flex items-center justify-center p-4 mb-6 overflow-hidden"}>
                      <img className={"w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"} data-alt={"Samsung Galaxy S24 Ultra Titanium Gray with included S-Pen stylus, angled sleek perspective, high-end studio lighting, elegant premium reflection"} src={"/images/4c581ca1dab55760.webp"} alt={"Samsung Galaxy S24 Ultra Titanium Gray with included S-Pen stylus, angled sleek perspective, high-end studio lighting, elegant premium reflection"} />
                      <span className={"absolute top-3 left-3 px-2.5 py-1 rounded-full bg-surface-container-lowest text-secondary font-caption text-caption font-semibold shadow-xs"}>
{" Galaxy AI "}
                      </span>
                    </div>
                    <div className={"flex items-center gap-1.5 mb-2"}>
                      <span className={"w-2 h-2 rounded-full bg-[#3B82F6]"}>

                      </span>
                      <span className={"font-caption text-caption text-on-surface-variant"}>
{"Titanium Xám"}
                      </span>
                    </div>
                    <h3 className={"font-headline-sm text-headline-sm text-on-surface font-semibold mb-1 group-hover:text-primary transition-colors"}>
{"Galaxy S24 Ultra"}
                    </h3>
                    <p className={"font-body-sm text-body-sm text-on-surface-variant mb-4"}>
{"Galaxy AI, Màn hình 6.8\" Dynamic AMOLED 2X, S-Pen đa nhiệm"}
                    </p>
                  </div>
                  <div>
                    <div className={"pt-4 border-t-0 bg-surface-container-low/40 -mx-6 -mb-6 p-6 rounded-b-3xl"}>
                      <p className={"font-caption text-caption text-on-surface-variant"}>
{"Giá ưu đãi từ"}
                      </p>
                      <p className={"font-headline-sm text-headline-sm text-primary font-bold mb-4"}>
{"28.490.000₫"}
                      </p>
                      <div className={"flex items-center gap-2"}>
                        <a className={"flex-1 py-2.5 px-3 rounded-xl bg-primary text-on-primary text-center font-label-md text-label-md font-semibold hover:bg-primary-container transition-all"} data-path={"chi-tiet-san-pham"} href={"#"}>
{" Xem chi tiết "}
                        </a>
                        <button aria-label={"So sánh Galaxy S24 Ultra"} className={"p-2.5 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"} title={"So sánh"} type={"button"}>
                          <span className={"material-symbols-outlined text-[20px]"}>
{"balance"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={"rounded-3xl bg-surface-container-lowest p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"}>
                  <div>
                    <div className={"relative w-full h-64 rounded-2xl bg-surface-container-low flex items-center justify-center p-4 mb-6 overflow-hidden"}>
                      <img className={"w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"} data-alt={"Xiaomi 14 Ultra flagship smartphone with massive Leica circular camera module, vegan leather back texture, white studio lighting, precision industrial design"} src={"/images/fff496ca0da06cf0.webp"} alt={"Xiaomi 14 Ultra flagship smartphone with massive Leica circular camera module, vegan leather back texture, white studio lighting, precision industrial design"} />
                      <span className={"absolute top-3 left-3 px-2.5 py-1 rounded-full bg-surface-container-lowest text-tertiary font-caption text-caption font-semibold shadow-xs"}>
{" Leica Quad "}
                      </span>
                    </div>
                    <div className={"flex items-center gap-1.5 mb-2"}>
                      <span className={"w-2 h-2 rounded-full bg-[#1F2937]"}>

                      </span>
                      <span className={"font-caption text-caption text-on-surface-variant"}>
{"Đen Ceramic Nano"}
                      </span>
                    </div>
                    <h3 className={"font-headline-sm text-headline-sm text-on-surface font-semibold mb-1 group-hover:text-primary transition-colors"}>
{"Xiaomi 14 Ultra"}
                    </h3>
                    <p className={"font-body-sm text-body-sm text-on-surface-variant mb-4"}>
{"Cảm biến 1-inch LYT-900, Snapdragon 8 Gen 3, Màn hình 2K LTPO"}
                    </p>
                  </div>
                  <div>
                    <div className={"pt-4 border-t-0 bg-surface-container-low/40 -mx-6 -mb-6 p-6 rounded-b-3xl"}>
                      <p className={"font-caption text-caption text-on-surface-variant"}>
{"Giá ưu đãi từ"}
                      </p>
                      <p className={"font-headline-sm text-headline-sm text-primary font-bold mb-4"}>
{"25.990.000₫"}
                      </p>
                      <div className={"flex items-center gap-2"}>
                        <a className={"flex-1 py-2.5 px-3 rounded-xl bg-primary text-on-primary text-center font-label-md text-label-md font-semibold hover:bg-primary-container transition-all"} data-path={"chi-tiet-san-pham"} href={"#"}>
{" Xem chi tiết "}
                        </a>
                        <button aria-label={"So sánh Xiaomi 14 Ultra"} className={"p-2.5 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"} title={"So sánh"} type={"button"}>
                          <span className={"material-symbols-outlined text-[20px]"}>
{"balance"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={"rounded-3xl bg-surface-container-lowest p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"}>
                  <div>
                    <div className={"relative w-full h-64 rounded-2xl bg-surface-container-low flex items-center justify-center p-4 mb-6 overflow-hidden"}>
                      <img className={"w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"} data-alt={"OPPO Find X7 Ultra two-tone leather and glass back design, dual periscope lenses, Hasselblad branding, luxury mobile phone aesthetic"} src={"/images/af04972e649c01ff.webp"} alt={"OPPO Find X7 Ultra two-tone leather and glass back design, dual periscope lenses, Hasselblad branding, luxury mobile phone aesthetic"} />
                      <span className={"absolute top-3 left-3 px-2.5 py-1 rounded-full bg-surface-container-lowest text-secondary font-caption text-caption font-semibold shadow-xs"}>
{" Dual Periscope "}
                      </span>
                    </div>
                    <div className={"flex items-center gap-1.5 mb-2"}>
                      <span className={"w-2 h-2 rounded-full bg-[#B45309]"}>

                      </span>
                      <span className={"font-caption text-caption text-on-surface-variant"}>
{"Nâu Tailored Leather"}
                      </span>
                    </div>
                    <h3 className={"font-headline-sm text-headline-sm text-on-surface font-semibold mb-1 group-hover:text-primary transition-colors"}>
{"OPPO Find X7 Ultra"}
                    </h3>
                    <p className={"font-body-sm text-body-sm text-on-surface-variant mb-4"}>
{"Camera tiềm vọng kép đầu tiên, HyperTone Engine, Sạc siêu tốc 100W"}
                    </p>
                  </div>
                  <div>
                    <div className={"pt-4 border-t-0 bg-surface-container-low/40 -mx-6 -mb-6 p-6 rounded-b-3xl"}>
                      <p className={"font-caption text-caption text-on-surface-variant"}>
{"Giá ưu đãi từ"}
                      </p>
                      <p className={"font-headline-sm text-headline-sm text-primary font-bold mb-4"}>
{"21.990.000₫"}
                      </p>
                      <div className={"flex items-center gap-2"}>
                        <a className={"flex-1 py-2.5 px-3 rounded-xl bg-primary text-on-primary text-center font-label-md text-label-md font-semibold hover:bg-primary-container transition-all"} data-path={"chi-tiet-san-pham"} href={"#"}>
{" Xem chi tiết "}
                        </a>
                        <button aria-label={"So sánh OPPO Find X7 Ultra"} className={"p-2.5 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"} title={"So sánh"} type={"button"}>
                          <span className={"material-symbols-outlined text-[20px]"}>
{"balance"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className={"w-full py-24 bg-surface relative"}>
            <div className={"max-w-[1240px] mx-auto px-gutter"}>
              <div className={"text-center max-w-[640px] mx-auto mb-16"}>
                <span className={"font-caption text-caption text-secondary uppercase font-bold tracking-widest"}>
{"Tiêu chuẩn mua sắm thế hệ mới"}
                </span>
                <h2 className={"font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight mt-2 mb-4"}>
{"Vì sao chọn SmartPhone AI?"}
                </h2>
                <p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed"}>
{" Chúng tôi tái định nghĩa trải nghiệm mua sắm công nghệ bằng sự chuẩn xác của AI và dịch vụ hậu mãi vượt trội. "}
                </p>
              </div>
              <div className={"grid grid-cols-1 md:grid-cols-3 gap-space-lg"}>
                <div className={"rounded-3xl bg-surface-container-lowest p-8 shadow-sm hover:shadow-md transition-all flex flex-col items-start"}>
                  <div className={"w-12 h-12 rounded-2xl bg-secondary-fixed flex items-center justify-center text-secondary mb-6"}>
                    <span className={"material-symbols-outlined text-[26px]"}>
{"verified_user"}
                    </span>
                  </div>
                  <h3 className={"font-headline-sm text-headline-sm text-on-surface font-semibold mb-3"}>
{"Tư vấn AI trung thực & khách quan"}
                  </h3>
                  <p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed"}>
{" Thuật toán đánh giá độc lập hoàn toàn không thiên vị nhãn hàng. Gợi ý sản phẩm thực sự tối ưu hóa cho bài toán tài chính và mục đích dùng thực tế của bạn. "}
                  </p>
                </div>
                <div className={"rounded-3xl bg-surface-container-lowest p-8 shadow-sm hover:shadow-md transition-all flex flex-col items-start"}>
                  <div className={"w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-[#16A34A] mb-6"}>
                    <span className={"material-symbols-outlined text-[26px]"}>
{"local_shipping"}
                    </span>
                  </div>
                  <h3 className={"font-headline-sm text-headline-sm text-on-surface font-semibold mb-3"}>
{"Giao hàng & Thanh toán COD"}
                  </h3>
                  <p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed"}>
{" Giao hỏa tốc 2 giờ tại nội thành. Đồng kiểm toàn diện tình trạng máy, phụ kiện nguyên seal và xác thực IMEI trước khi thanh toán tiền mặt an toàn. "}
                  </p>
                </div>
                <div className={"rounded-3xl bg-surface-container-lowest p-8 shadow-sm hover:shadow-md transition-all flex flex-col items-start"}>
                  <div className={"w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary mb-6"}>
                    <span className={"material-symbols-outlined text-[26px]"}>
{"sync"}
                    </span>
                  </div>
                  <h3 className={"font-headline-sm text-headline-sm text-on-surface font-semibold mb-3"}>
{"Bảo hành 1 đổi 1 trong 30 ngày"}
                  </h3>
                  <p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed"}>
{" Yên tâm tuyệt đối với chính sách đổi mới ngay lập tức nếu phát sinh lỗi từ nhà sản xuất trong tháng đầu tiên. Bảo hành chính hãng 12 tháng kế tiếp. "}
                  </p>
                </div>
              </div>
              <div className={"mt-16 rounded-3xl bg-gradient-to-r from-secondary-container to-secondary p-8 md:p-10 shadow-lg text-on-secondary flex flex-col md:flex-row items-center justify-between gap-6"}>
                <div className={"flex items-center gap-4"}>
                  <div className={"w-14 h-14 rounded-2xl bg-on-secondary/10 backdrop-blur-md flex items-center justify-center text-on-secondary shrink-0"}>
                    <span className={"material-symbols-outlined text-[32px]"}>
{"contact_support"}
                    </span>
                  </div>
                  <div>
                    <h4 className={"font-headline-sm text-headline-sm font-bold"}>
{"Cần hỗ trợ so sánh cấu hình ngay bây giờ?"}
                    </h4>
                    <p className={"font-body-sm text-body-sm text-on-secondary/80 mt-1"}>
{"Trợ lý AI sẵn sàng phân tích dữ liệu hiệu năng thực tế 24/7 theo câu hỏi của bạn."}
                    </p>
                  </div>
                </div>
                <a className={"whitespace-nowrap px-6 py-3 rounded-full bg-surface-container-lowest text-secondary font-label-md text-label-md font-semibold hover:bg-secondary-fixed transition-colors shadow-sm"} data-path={"chon-chu-de-ai"} href={"#"}>
{" Khởi động AI Trợ lý "}
                </a>
              </div>
            </div>
          </section>
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
