// The shared payment workspace keeps both routes on the same filters and owner.
// Its server-authorized first paint remains visible until the shared script mounts.
function set_main() {
  return window.WebRPaymentWorkspace ? window.WebRPaymentWorkspace.mount() : null;
}
function get_main() {
  return set_main();
}
window.set_main = set_main;
window.get_main = get_main;
