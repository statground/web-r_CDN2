async function click_btn_delete() {
  if (confirm("\uC815\uB9D0\uB85C \uC0AD\uC81C\uD560\uAE4C\uC694?")) {
    const request_data = new FormData();
    request_data.append("uuid", orderID);
    try {
      const response = await fetch("/blank/ajax_board/delete_article/", {
        method: "post",
        headers: { "X-CSRFToken": getCookie("csrftoken") },
        body: request_data
      });
      if (!response.ok) {
        throw new Error(`delete_article HTTP ${response.status}`);
      }
      const result = await response.json();
      if (!result || result.checker !== "SUCCESS") {
        alert(result && result.error || "\uAC8C\uC2DC\uAE00\uC744 \uC0AD\uC81C\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uD604\uC7AC \uAE00\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694.");
        return;
      }
      location.href = init_url;
    } catch (_) {
      alert("\uC0AD\uC81C \uC0C1\uD0DC\uB97C \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uD604\uC7AC \uAE00\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694.");
    }
  }
}
