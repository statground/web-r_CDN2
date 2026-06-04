let data_footer = {
	"company": "주식회사 통계마당",
	"representative": "대표, 개인정보보호책임자: 유재성",
	"registration_no": "사업자등록번호: 795-88-02574",
	"mail_order_no": "통신판매업신고번호: 2024-서울강남-06145",
	"address": "서울특별시 강남구 테헤란로70길 12, 402-106A호",
	"phone": "대표전화: 0507-1300-9704",
	"email": "문의: cs@statground.net",
}

function set_footer(service) {
	function Div_footer(props) {
		function Div_footer_address(props) {
			let footer_top_style = {
				alignItems: "flex-start",
				display: "flex",
				gap: "16px",
				justifyContent: "space-between",
				width: "100%",
			}
			let footer_nav_style = {
				flexShrink: 0,
				marginLeft: "auto",
				maxWidth: "60%",
			}
			let footer_items = [
				data_footer.company,
				data_footer.representative,
			]
			if (data_footer.administrator != null && String(data_footer.administrator).trim() !== "") {
				footer_items.push(data_footer.administrator)
			}
			footer_items = footer_items.concat([
				data_footer.registration_no,
				data_footer.mail_order_no,
				data_footer.address,
				data_footer.phone + "　|　" + data_footer.email,
			])

			return (
				<div class="flex flex-col gap-2 text-sm text-gray-600">
					<div class="footer-top-row" style={footer_top_style}>
						<p class="leading-5">
							통계마당의 모든 컨텐츠는 저작권법에 의거 보호받고 있습니다.
						</p>

						<nav class="footer-menu-nav" style={footer_nav_style}>
							{
								service == null
								?   <Div_footer_sub_menu />
								:   ""
							}
							{
								service == "webr"
								?   <Div_footer_sub_menu_webr />
								:   ""
							}
						</nav>
					</div>

					<div class="flex flex-wrap items-center gap-x-5 gap-y-1">
						{
							footer_items.map((item) => (
								<span key={item} class="leading-5 whitespace-nowrap md:whitespace-normal">
									{item}
								</span>
							))
						}
					</div>
				</div>
			)
		}

		function Div_footer_sub_menu(props) {
			let class_sub_menu = "hover:underline hover:decoration-gray-900 hover:decoration-wavy"
			let footer_menu_style = {
				alignItems: "center",
				display: "flex",
				flexWrap: "wrap",
				gap: "4px 20px",
				justifyContent: "flex-end",
				listStyle: "none",
				margin: 0,
				padding: 0,
				textAlign: "right",
			}
			return (
				<ul class="footer-menu-list" style={footer_menu_style}>
					<li>
						<a href="/intro/notice/" class={class_sub_menu}>공지사항</a>
					</li>
					<li>
						<a href="/intro/" class={class_sub_menu}>회사 소개</a>
					</li>
					<li>
						<a href="/intro/terms/" class={class_sub_menu}>서비스 이용약관</a>
					</li>
					<li>
						<a href="/intro/privates/" class={class_sub_menu}>개인정보 보호 방침</a>
					</li>
				</ul>
			)
		}

		function Div_footer_sub_menu_webr(props) {
			let class_sub_menu = "hover:underline hover:decoration-gray-900 hover:decoration-wavy"
			let footer_menu_style = {
				alignItems: "center",
				display: "flex",
				flexWrap: "wrap",
				gap: "4px 20px",
				justifyContent: "flex-end",
				listStyle: "none",
				margin: 0,
				padding: 0,
				textAlign: "right",
			}
			return (
				<ul class="footer-menu-list" style={footer_menu_style}>
					<li>
						<a href="https://web-r.org/notice" target="_blank" class={class_sub_menu}>공지사항</a>
					</li>
					<li>
						<a href="/intro" class={class_sub_menu}>회사 소개</a>
					</li>
					<li>
						<a href="https://web-r.org/foot_info" target="_blank" class={class_sub_menu}>서비스 이용약관</a>
					</li>
					<li>
						<a href="https://web-r.org/privates" target="_blank" class={class_sub_menu}>개인정보 보호 방침</a>
					</li>
				</ul>
			)
		}

		function Div_footer_icons(props) {
			function Div_sub_icon(props) {
				return (
					<a title={props.name} class="text-gray-500 hover:text-gray-900" href={props.url} target="_blank" alt={props.name}>
						<img src={props.url_icon} class="w-4 h-4" />
					</a>
				)
			}
			return (
				<div class="flex flex-row justify-center space-x-6 w-full">
					<Div_sub_icon name={"Facebook Group"}
								  url={"https://www.facebook.com/groups/statground"}
								  url_icon={"https://cdn.jsdelivr.net/gh/statground/Common_CDN/images/svg/footer_facebook_group.svg"} />
					<Div_sub_icon name={"Facebook Page"}
								  url={"https://www.facebook.com/Statground"}
								  url_icon={"https://cdn.jsdelivr.net/gh/statground/Common_CDN/images/svg/footer_facebook_page.svg"} />
					<Div_sub_icon name={"Twitter"}
								  url={"https://twitter.com/Statground1"}
								  url_icon={"https://cdn.jsdelivr.net/gh/statground/Common_CDN/images/svg/footer_twitter_x.svg"} />
					<Div_sub_icon name={"Instagram"}
								  url={"https://www.instagram.com/statground/"}
								  url_icon={"https://cdn.jsdelivr.net/gh/statground/Common_CDN/images/svg/footer_instagram.svg"} />
					<Div_sub_icon name={"LinkedIn"}
								  url={"https://www.linkedin.com/company/82371650/"}
								  url_icon={"https://cdn.jsdelivr.net/gh/statground/Common_CDN/images/svg/footer_linkedin.svg"} />
					<Div_sub_icon name={"Threads"}
								  url={"https://www.threads.net/@statground"}
								  url_icon={"https://cdn.jsdelivr.net/gh/statground/Common_CDN/images/svg/footer_threads.svg"} />
				</div>
			)
		}

		return (
			<div class="py-5 bg-white rounded-lg md:py-4 w-full">
				<div class="w-full px-4">
					<Div_footer_address />
				</div>
		
				<hr class="my-4 border-gray-200" />
				
				<div class="flex flex-row justify-center items-center w-full">
					<Div_footer_icons />
				</div>
			</div>
		)
	}

	ReactDOM.render(<Div_footer />, document.getElementById("div_footer"))
}
