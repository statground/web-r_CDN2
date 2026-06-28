function set_main() {
  function Div_main() {
    return React.createElement(
      "section",
      { className: "bg-white" },
      React.createElement(
        "div",
        { className: "mx-auto max-w-screen-xl px-4 py-8 sm:py-16 lg:px-6" },
        React.createElement(
          "div",
          { className: "mx-auto mb-10 max-w-screen-lg text-center" },
          React.createElement(
            "h2",
            { className: "mb-2 text-4xl font-extrabold tracking-tight text-gray-900" },
            "환불 정책"
          ),
          React.createElement(
            "p",
            { className: "text-gray-600" },
            "Web-R 유료 서비스와 상품 결제에 대한 환불 및 결제 취소 기준입니다."
          )
        ),
        React.createElement(
          "div",
          { className: "mx-auto max-w-screen-lg space-y-4 rounded-lg border border-gray-200 p-8 text-left leading-7 text-gray-700" },
          React.createElement(
            "p",
            null,
            "환불 또는 결제 취소가 필요한 경우 결제 계정 정보와 주문일, 주문번호를 포함해 고객지원 이메일(",
            React.createElement(
              "a",
              { href: "mailto:cs@statground.net", className: "font-semibold text-blue-700 hover:text-blue-900 hover:underline" },
              "cs@statground.net"
            ),
            ") 또는 운영 채널로 문의해 주세요."
          ),
          React.createElement(
            "p",
            null,
            "환불은 실제 승인·정산 상태와 주문 로그를 기준으로 처리하며, 웹사이트/카드사/가상계좌 상태를 함께 확인합니다."
          ),
          React.createElement(
            "p",
            null,
            "중복 결제, 승인 실패, 웹훅 반영 지연 같은 예외 상황은 서버 로그와 결제사 응답을 기준으로 확인해 보정합니다."
          ),
          React.createElement(
            "p",
            null,
            "환불 완료 시점은 결제수단과 결제사 처리 상태에 따라 달라질 수 있습니다."
          )
        )
      )
    );
  }
  ReactDOM.render(React.createElement(Div_main, null), document.getElementById("div_main"));
}
