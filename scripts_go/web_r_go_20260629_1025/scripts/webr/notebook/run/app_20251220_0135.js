function Notebook() {
  const { useState, useEffect, useLayoutEffect, useRef } = React;
  function getNotebookIdFromUrl() {
    try {
      var p = location.pathname || "";
      var m1 = p.match(/\/webr\/notebook\/run\/([^\/]+)(?:\/|$)/);
      if (m1 && m1[1])
        return m1[1];
      var m2 = p.match(/\/webr\/notebook\/view\/([^\/]+)(?:\/|$)/);
      if (m2 && m2[1])
        return m2[1];
    } catch (e) {
    }
    return null;
  }
  const notebookIdFromUrlRef = useRef(getNotebookIdFromUrl());
  const runtimeSessionInfoFromMetaRef = useRef(false);
  const isViewMode = !!window.WEBR_VIEW_MODE || /\/notebook\/view\//.test(location.pathname || "");
  const notebookShellMode = String(window.WEBR_NOTEBOOK_SHELL_MODE || "").toLowerCase();
  const isSiteMode = notebookShellMode === "site";
  const [canEdit, setCanEdit] = useState(!isViewMode);
  const canModifyNotebook = canEdit && !isViewMode;
  const [shareMode, setShareMode] = useState(0);
  const shareEnabled = shareMode > 0;
  const [shareUUID, setShareUUID] = useState("");
  const [webrInstance, setWebrInstance] = useState(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(isViewMode && notebookIdFromUrlRef.current ? "Loading..." : "Initializing...");
  const [notebookLoadState, setNotebookLoadState] = useState(isViewMode && notebookIdFromUrlRef.current ? "loading" : "idle");
  const [runtimeSessionInfo, setRuntimeSessionInfo] = useState(isViewMode ? "View mode (runtime not started)." : "Loading runtime info...");
  const [runtimeSessionInfoError, setRuntimeSessionInfoError] = useState("");
  const darkMode = false;
  const [notebookTitle, setNotebookTitle] = useState("Untitled Web-R Notebook");
  const headerRef = useRef(null);
  const [headerH, setHeaderH] = useState(56);
  const [isDesktop, setIsDesktop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    try {
      const mql = window.matchMedia("(min-width: 1024px)");
      const apply = (matches) => {
        setIsDesktop(!!matches);
        setSidebarOpen(!!matches);
      };
      apply(mql.matches);
      const onChange = (e) => apply(e.matches);
      if (mql.addEventListener)
        mql.addEventListener("change", onChange);
      else
        mql.addListener(onChange);
      return () => {
        if (mql.removeEventListener)
          mql.removeEventListener("change", onChange);
        else
          mql.removeListener(onChange);
      };
    } catch (e) {
      setIsDesktop(true);
      setSidebarOpen(true);
    }
  }, []);
  useLayoutEffect(() => {
    const measure = () => {
      try {
        const h = headerRef.current ? headerRef.current.getBoundingClientRect().height : 56;
        if (h && Math.abs(h - headerH) > 1)
          setHeaderH(h);
      } catch (e) {
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [headerH]);
  useEffect(() => {
    try {
      if (!isDesktop)
        document.body.style.overflow = sidebarOpen ? "hidden" : "";
      else
        document.body.style.overflow = "";
    } catch (e) {
    }
  }, [isDesktop, sidebarOpen]);
  const [showHelp, setShowHelp] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareText, setShareText] = useState("");
  const [shareWorking, setShareWorking] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginAccount, setLoginAccount] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginTab, setLoginTab] = useState("signin");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupNickname, setSignupNickname] = useState("");
  const [signupRealname, setSignupRealname] = useState("");
  const [signupGender, setSignupGender] = useState("\uB0A8\uC790");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPw, setForgotNewPw] = useState("");
  const [forgotStep, setForgotStep] = useState(1);
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authWorking, setAuthWorking] = useState(false);
  const [authError, setAuthError] = useState("");
  const authFailCountRef = useRef(0);
  const googleButtonRef = useRef(null);
  const [googleLoginStatus, setGoogleLoginStatus] = useState("");
  const googleClientID = String((notebookLegacyGlobals().google_client_id || window.google_client_id || "")).trim();
  const googleLoginNonce = String((notebookLegacyGlobals().google_login_nonce || window.google_login_nonce || "")).trim();
  async function refreshAuth() {
    setAuthLoading(true);
    try {
      const u = await apiGetUserInfo();
      authFailCountRef.current = 0;
      setAuthUser(u);
    } catch (e) {
      authFailCountRef.current += 1;
      if (authFailCountRef.current >= 3)
        setAuthUser(null);
    } finally {
      setAuthLoading(false);
    }
  }
  useEffect(() => {
    refreshAuth();
    function onFocus() {
      refreshAuth();
    }
    window.addEventListener("focus", onFocus);
    const t = setInterval(refreshAuth, 60 * 1e3);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(t);
    };
  }, []);
  useEffect(() => {
    if (!showLogin || loginTab !== "signin" || !googleClientID || !googleLoginNonce)
      return;
    let canceled = false;
    const renderGoogleButton = (attempt = 0) => {
      if (canceled)
        return;
      const target = googleButtonRef.current;
      if (!target)
        return;
      if (!window.google || !window.google.accounts || !window.google.accounts.id) {
        if (attempt < 80) {
          window.setTimeout(() => renderGoogleButton(attempt + 1), 50);
        } else {
          setGoogleLoginStatus("Google \uB85C\uADF8\uC778 \uC2A4\uD06C\uB9BD\uD2B8\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
        }
        return;
      }
      try {
        target.innerHTML = "";
        window.google.accounts.id.initialize({
          client_id: googleClientID,
          nonce: googleLoginNonce,
          ux_mode: "popup",
          callback: async (response) => {
            if (!response || !response.credential) {
              setAuthError("\uAD6C\uAE00 \uACC4\uC815 \uC751\uB2F5\uC774 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.");
              return;
            }
            setAuthError("");
            setGoogleLoginStatus("Google \uACC4\uC815\uC744 \uD655\uC778\uD558\uB294 \uC911\uC785\uB2C8\uB2E4.");
            setAuthWorking(true);
            try {
              const r = await apiGoogleLoginCredential(response.credential);
              if (r && r.result === "ok") {
                await refreshAuth();
                setGoogleLoginStatus("");
                setShowLogin(false);
              } else {
                setAuthError(r && r.err ? r.err : "\uAD6C\uAE00 \uB85C\uADF8\uC778\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
              }
            } catch (err) {
              setAuthError(err && err.message ? err.message : "\uAD6C\uAE00 \uB85C\uADF8\uC778\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
            } finally {
              setGoogleLoginStatus("");
              setAuthWorking(false);
            }
          }
        });
        window.google.accounts.id.renderButton(target, {
          theme: "outline",
          size: "large",
          shape: "rectangular",
          width: Math.max(280, Math.min(380, target.clientWidth || 360))
        });
        setGoogleLoginStatus("");
      } catch (e) {
        setGoogleLoginStatus("\uAD6C\uAE00 \uB85C\uADF8\uC778 \uBC84\uD2BC\uC744 \uCD08\uAE30\uD654\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
      }
    };
    renderGoogleButton();
    return () => {
      canceled = true;
    };
  }, [showLogin, loginTab, googleClientID, googleLoginNonce]);
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayText, setOverlayText] = useState("Booting WebR...");
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  function showToast(message, kind = "ok") {
    try {
      setToast({ message, kind, at: Date.now() });
      if (toastTimerRef.current)
        clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToast(null), 1800);
    } catch (e) {
    }
  }
  const [cells, setCells] = useState(isViewMode && notebookIdFromUrlRef.current ? [] : [
    {
      id: 1,
      mode: "markdown",
      source: INITIAL_LATEX_LINES.join("\n"),
      output: {
        type: "markdown",
        html: renderMarkdown(INITIAL_LATEX_LINES.join("\n"))
      },
      mdPreview: true,
      showCode: true,
      showOutput: true
    },
    {
      id: 2,
      mode: "r",
      source: INITIAL_R_LINES.join("\n"),
      output: null,
      mdPreview: false,
      showCode: true,
      showOutput: true
    }
  ]);
  const [activeCellId, setActiveCellId] = useState(2);
  useEffect(() => {
    try {
      document.documentElement.classList.remove("dark");
    } catch (e) {
    }
    setTimeout(() => {
      try {
        document.querySelectorAll(".CodeMirror").forEach((el) => {
          const cm = el && el.CodeMirror;
          if (!cm)
            return;
          try {
            cm.setOption("theme", "default");
          } catch (e) {
          }
          try {
            cm.refresh();
          } catch (e) {
          }
        });
      } catch (e) {
      }
    }, 50);
  }, []);
  useEffect(() => {
    setTimeout(() => {
      try {
        document.querySelectorAll(".CodeMirror").forEach((el) => {
          const cm = el && el.CodeMirror;
          if (!cm)
            return;
          try {
            cm.setOption("theme", "default");
          } catch (e) {
          }
          try {
            cm.refresh();
          } catch (e) {
          }
        });
      } catch (e) {
      }
    }, 30);
  }, [cells, activeCellId]);
  async function fetchRuntimeSessionInfo(webr) {
    try {
      setRuntimeSessionInfoError("");
      if (!webr)
        return;
      try {
        if (typeof webr.evalRString === "function") {
          const s = await webr.evalRString('paste(capture.output(sessionInfo()), collapse="\\n")');
          setRuntimeSessionInfo(String(s || ""));
          runtimeSessionInfoFromMetaRef.current = true;
          return;
        }
      } catch (e1) {
      }
      const shelter = await new webr.Shelter();
      const result = await shelter.captureR('cat(paste(capture.output(sessionInfo()), collapse="\\n"))', {
        withAutoprint: false,
        captureStreams: true,
        captureGraphics: false
      });
      let out = "";
      if (Array.isArray(result && result.output)) {
        out = result.output.filter((o) => o.type === "stdout" || o.type === "stderr").map((o) => o.data).join("\n");
      } else {
        out = (result && result.stdout ? result.stdout : "") + (result && result.stderr ? result.stderr : "");
      }
      setRuntimeSessionInfo(String(out || ""));
      runtimeSessionInfoFromMetaRef.current = true;
      try {
        shelter.purge();
      } catch (e2) {
      }
    } catch (e) {
      console.warn("fetchRuntimeSessionInfo failed:", e);
      setRuntimeSessionInfoError(e && e.message ? e.message : String(e));
      setRuntimeSessionInfo("(failed to load runtime info)");
    }
  }
  useEffect(() => {
    if (isViewMode) {
      setShowOverlay(false);
      setReady(false);
      if (!notebookIdFromUrlRef.current)
        setStatus("View mode");
      return;
    }
    let cancelled = false;
    async function initWebR() {
      try {
        setShowOverlay(true);
        setOverlayText("Downloading WebR runtime...");
        const WebRClass = await waitForWebR();
        if (cancelled)
          return;
        const webr = new WebRClass({
          defaultPackages: ["base", "graphics", "grDevices", "stats"],
          RArgs: ["--quiet"]
        });
        setStatus("Starting WebR...");
        await webr.init();
        if (cancelled)
          return;
        await webr.evalRVoid('options(repos = c(CRAN = "https://repo.r-wasm.org"))');
        await webr.evalRVoid("options(device = webr::canvas)");
        await webr.evalRVoid(`
          options(
            help_type = "text",
            pager = function(files, header, title, delete.file) {
              if (length(files) == 0L) return(invisible())
              out <- character()
              for (f in files) {
                if (file.exists(f)) {
                  txt <- tryCatch({
                      raw_txt <- readLines(f, warn = FALSE, encoding = "UTF-8")
                      iconv(raw_txt, from = "UTF-8", to = "UTF-8", sub = "byte")
                    }, error = function(e) character())
                  out <- c(out, txt, "")
                }
              }
              if (length(out)) { cat(paste(out, collapse = "
"), sep = "
") }
              invisible()
            }
          )
        `);
        setWebrInstance(webr);
        if (!runtimeSessionInfoFromMetaRef.current) {
          fetchRuntimeSessionInfo(webr);
        }
        setStatus("Ready");
        setReady(true);
        setOverlayText("WebR is ready.");
        setTimeout(() => setShowOverlay(false), 300);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setStatus("Failed to start WebR");
          setOverlayText("Initialization failed:\n" + (e.message || String(e)));
        }
      }
    }
    initWebR();
    return () => {
      cancelled = true;
    };
  }, []);
  function addCellBelow(targetId) {
    setCells((prev) => {
      const idx = prev.findIndex((c) => c.id === targetId);
      const newId = nextCellId();
      const newCell = {
        id: newId,
        mode: "r",
        source: "",
        output: null,
        mdPreview: false,
        showCode: true,
        showOutput: true
      };
      if (idx === -1)
        return [...prev, newCell];
      const newArr = [...prev];
      newArr.splice(idx + 1, 0, newCell);
      return newArr;
    });
  }
  function deleteCell(id) {
    setCells((prev) => {
      if (prev.length <= 1)
        return prev;
      const idx = prev.findIndex((c) => c.id === id);
      const filtered = prev.filter((c) => c.id !== id);
      if (idx !== -1 && activeCellId === id && filtered.length > 0) {
        const newIdx = Math.max(0, idx - 1);
        setActiveCellId(filtered[newIdx].id);
      }
      return filtered;
    });
  }
  function moveCell(id, direction) {
    setCells((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1)
        return prev;
      const newArr = [...prev];
      const [cell] = newArr.splice(idx, 1);
      let newIndex = idx + (direction === "up" ? -1 : 1);
      newIndex = Math.max(0, Math.min(newIndex, newArr.length));
      newArr.splice(newIndex, 0, cell);
      return newArr;
    });
  }
  async function runRCell(id, insertBelow = false) {
    const cell = cells.find((c) => c.id === id);
    if (!cell || cell.mode !== "r" || !webrInstance)
      return;
    setBusy(true);
    setStatus(`Running cell ${id}...`);
    try {
      const code = cell.source || "";
      const shelter = await new webrInstance.Shelter();
      const result = await shelter.captureR(code, {
        withAutoprint: true,
        captureStreams: true,
        captureGraphics: { width: 504, height: 504, bg: "white" }
      });
      let textOut = "";
      if (Array.isArray(result.output)) {
        textOut = result.output.filter((o) => o.type === "stdout" || o.type === "stderr").map((o) => o.data).join("\n");
      } else {
        textOut = (result.stdout || "") + (result.stderr || "");
      }
      const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
      textOut = textOut.replace(ansiRegex, "").replace(/.\u0008/g, "");
      let newOutput = null;
      const images = result.images || [];
      if (images.length > 0) {
        const img = images[images.length - 1];
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imgUrl = canvas.toDataURL("image/png");
        newOutput = {
          type: "image",
          src: imgUrl,
          inlineSize: "small",
          toggleSize: () => {
            setCells(
              (prev) => prev.map((c) => {
                if (c.id !== id)
                  return c;
                const currentSize = (c.output && c.output.inlineSize) === "large" ? "small" : "large";
                return { ...c, output: { ...c.output, inlineSize: currentSize } };
              })
            );
          }
        };
      } else {
        newOutput = { type: "text", text: textOut || "Done (no output)" };
      }
      setCells((prev) => prev.map((c) => c.id === id ? { ...c, output: newOutput } : c));
      setStatus(`Finished running cell ${id}`);
      if (insertBelow)
        addCellBelow(id);
      shelter.purge();
    } catch (e) {
      console.error(e);
      setCells(
        (prev) => prev.map((c) => c.id === id ? { ...c, output: { type: "text", text: String(e.message || e) } } : c)
      );
      setStatus(`Error in cell ${id}`);
    } finally {
      setBusy(false);
    }
  }
  function runMarkdownCell(id) {
    const cell = cells.find((c) => c.id === id);
    if (!cell || cell.mode !== "markdown")
      return;
    const html = renderMarkdown(cell.source || "");
    const newOutput = { type: "markdown", html };
    setCells((prev) => prev.map((c) => c.id === id ? { ...c, output: newOutput, mdPreview: true } : c));
    setStatus(`Rendered markdown cell ${id}`);
  }
  async function runAllCells() {
    for (const cell of cells) {
      if (cell.mode === "r")
        await runRCell(cell.id, false);
      if (cell.mode === "markdown")
        runMarkdownCell(cell.id);
    }
  }
  function handleRunAll() {
    runAllCells();
  }
  function notebookModeHref(nextMode) {
    try {
      const url = new URL(location.href);
      if (nextMode === "focus")
        url.searchParams.set("mode", "focus");
      else
        url.searchParams.delete("mode");
      return url.pathname + url.search + url.hash;
    } catch (e) {
      return nextMode === "focus" ? "?mode=focus" : location.pathname || "/webr/notebook/";
    }
  }
  function replaceWithNotebookRunURL(notebookID) {
    if (!notebookID || !window.history || !window.history.replaceState)
      return;
    try {
      const url = new URL("/webr/notebook/run/" + encodeURIComponent(notebookID) + "/", location.href);
      if (!isSiteMode)
        url.searchParams.set("mode", "focus");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (e) {
    }
  }
  useEffect(() => {
    function handleKeyDown(e) {
      const key = e.key;
      const isRunAllCombo = key === "Enter" && e.altKey && (e.ctrlKey || e.metaKey);
      const isAltEnter = key === "Enter" && e.altKey && !e.ctrlKey && !e.metaKey;
      const isRunCombo = key === "Enter" && !e.altKey && (e.shiftKey || e.ctrlKey || e.metaKey);
      const hasPrimary = e.ctrlKey || e.metaKey;
      const isNewCombo = (key === "n" || key === "N") && hasPrimary && e.altKey && !e.shiftKey;
      const isSaveCombo = (key === "s" || key === "S") && hasPrimary && !e.altKey && !e.shiftKey;
      const isShareCombo = (key === "s" || key === "S") && hasPrimary && e.altKey && !e.shiftKey;
      const isHelpCombo = key === "F1" || (key === "h" || key === "H") && hasPrimary && e.altKey && !e.shiftKey;
      if (!isRunAllCombo && !isAltEnter && !isRunCombo && !isNewCombo && !isSaveCombo && !isShareCombo && !isHelpCombo)
        return;
      if (isNewCombo) {
        e.preventDefault();
        e.stopPropagation();
        if (canModifyNotebook && !busy)
          handleNewNotebook();
        return;
      }
      if (isSaveCombo) {
        e.preventDefault();
        e.stopPropagation();
        if (canModifyNotebook && !busy)
          handleSaveNotebook();
        return;
      }
      if (isShareCombo) {
        e.preventDefault();
        e.stopPropagation();
        if (!isViewMode)
          handleShare();
        return;
      }
      if (isHelpCombo) {
        if (isViewMode)
          return;
        e.preventDefault();
        e.stopPropagation();
        setShowHelp(true);
        return;
      }
      if (isRunAllCombo) {
        if (!canModifyNotebook || !ready || busy)
          return;
        e.preventDefault();
        e.stopPropagation();
        runAllCells();
        return;
      }
      const activeEl = document.activeElement;
      const inCM = activeEl && typeof activeEl.closest === "function" && activeEl.closest(".CodeMirror");
      if (!inCM)
        return;
      const cell = cells.find((c) => c.id === activeCellId);
      if (!cell)
        return;
      e.preventDefault();
      e.stopPropagation();
      if (isAltEnter) {
        addCellBelow(activeCellId);
        return;
      }
      if (isRunCombo) {
        if (cell.mode === "r") {
          const insertBelow = (e.ctrlKey || e.metaKey) && e.shiftKey;
          runRCell(cell.id, insertBelow);
        } else if (cell.mode === "markdown") {
          runMarkdownCell(cell.id);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [cells, activeCellId, canModifyNotebook, ready, busy, isViewMode, notebookTitle, shareMode, runtimeSessionInfo]);
  function handleNewNotebook() {
    if (!window.confirm("\uD604\uC7AC \uB178\uD2B8\uBD81 \uB0B4\uC6A9\uC744 \uBAA8\uB450 \uC9C0\uC6B0\uACE0 \uC0C8\uB85C \uC2DC\uC791\uD560\uAE4C\uC694?"))
      return;
    setCells([
      {
        id: 1,
        mode: "r",
        source: "",
        output: null,
        mdPreview: false,
        showCode: true,
        showOutput: true
      }
    ]);
    setActiveCellId(1);
    setNotebookTitle("Untitled Web-R Notebook");
    notebookIdFromUrlRef.current = null;
    setShareMode(0);
    setShareUUID("");
    setDataFiles([]);
    setInstalledPackages([...CORE_PACKAGES]);
    setPkgInput("");
    setStatus("New notebook");
    try {
      if (window.history && window.history.replaceState) {
        const url = new URL(location.href);
        url.pathname = "/webr/notebook/new/";
        if (isSiteMode)
          url.searchParams.delete("mode");
        else
          url.searchParams.set("mode", "focus");
        window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      }
    } catch (e) {
    }
  }
  async function handleSaveNotebook() {
    const nbid = notebookIdFromUrlRef.current || "";
    if (!window.confirm("\uD604\uC7AC \uB178\uD2B8\uBD81\uC744 \uC800\uC7A5\uD560\uAE4C\uC694?"))
      return;
    const payload = {
      version: "2.0",
      cells: cells.map((c) => ({
        id: c.id,
        mode: c.mode,
        source: c.source,
        showCode: c.showCode !== false,
        showOutput: c.showOutput !== false,
        output: c.output && c.output.type === "image" ? { type: "image", src: c.output.src, inlineSize: c.output.inlineSize } : c.output && c.output.type === "text" ? { type: "text", text: c.output.text } : null
      })),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      runtime_sessionInfo: typeof runtimeSessionInfo === "string" ? runtimeSessionInfo : ""
    };
    try {
      setBusy(true);
      setStatus("Saving...");
      const parts = buildDbPartsFromNotebookState();
      const res = await apiSaveNotebook(nbid, notebookTitle, { ...parts, share: shareMode, _skip_confirm: true });
      if (res && res.ok) {
        if (!nbid && res.notebook_uuid) {
          notebookIdFromUrlRef.current = res.notebook_uuid;
          replaceWithNotebookRunURL(res.notebook_uuid);
        }
        if (typeof res.share !== "undefined") {
          const nextShare = res.share === 2 || res.share === "2" ? 2 : res.share === 1 || res.share === "1" || res.share === true ? 1 : 0;
          setShareMode(nextShare);
          setShareUUID(nextShare > 0 ? res.uuid_share || "" : "");
        }
        setStatus("Saved");
        showToast("\uC800\uC7A5 \uC644\uB8CC!");
      } else {
        alert(res && res.msg ? res.msg : "Save failed");
        setStatus("Save failed");
        showToast("\uC800\uC7A5 \uC2E4\uD328", "err");
      }
    } catch (e) {
      console.error(e);
      alert("Save error");
      setStatus("Save error");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!canModifyNotebook)
      return;
    const nbid = notebookIdFromUrlRef.current;
    if (!nbid)
      return;
    const timer = setInterval(async () => {
      try {
        const parts = buildDbPartsFromNotebookState();
        await apiSaveNotebook(nbid, notebookTitle, {
          ...parts,
          share: shareMode,
          autosave: 1,
          _skip_confirm: true
        });
      } catch (e) {
        console.warn("autosave failed:", e);
      }
    }, 60 * 1e3);
    return () => clearInterval(timer);
  }, [canModifyNotebook, notebookTitle, cells, shareMode, runtimeSessionInfo]);
  async function handleSetShareMode(nextMode) {
    let nbid = notebookIdFromUrlRef.current;
    const modeNum = nextMode === 2 || nextMode === "2" ? 2 : nextMode === 1 || nextMode === "1" || nextMode === true ? 1 : 0;
    if (!canModifyNotebook)
      return;
    try {
      setBusy(true);
      setStatus("Updating share...");
      if (modeNum === shareMode && nbid) {
        setStatus("Share unchanged");
        return;
      }
      setShareWorking(modeNum);
      if (!nbid) {
        const parts = buildDbPartsFromNotebookState();
        const saved = await apiSaveNotebook("", notebookTitle, { ...parts, share: 0, _skip_confirm: true });
        if (!saved || !saved.ok || !saved.notebook_uuid) {
          alert(saved && saved.msg ? saved.msg : "\uB178\uD2B8\uBD81\uC744 \uBA3C\uC800 \uC800\uC7A5\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
          setStatus("Share failed");
          return;
        }
        nbid = saved.notebook_uuid;
        notebookIdFromUrlRef.current = nbid;
        replaceWithNotebookRunURL(nbid);
        setShareUUID(saved.uuid_share || "");
      }
      const res = await apiToggleNotebookShare(nbid, modeNum);
      if (res && res.ok) {
        setShareMode(res.share === 2 || res.share === "2" ? 2 : res.share === 1 || res.share === "1" || res.share === true ? 1 : 0);
        setShareUUID(res.uuid_share || "");
        setStatus("Share updated");
        showToast("\uACF5\uC720 \uC124\uC815\uC744 \uBC14\uAFC4\uC2B5\uB2C8\uB2E4.");
      } else {
        alert(res && res.msg ? res.msg : "\uACF5\uC720 \uC124\uC815\uC744 \uBC14\uAFB8\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
        setStatus("Share failed");
      }
    } catch (e) {
      console.error(e);
      alert("\uACF5\uC720 \uC124\uC815\uC744 \uBC14\uAFB8\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
      setStatus("Share failed");
    } finally {
      setShareWorking(null);
      setBusy(false);
    }
  }
  function handleShare() {
    setShowShare(true);
  }
  function applyShareJson() {
    try {
      const parsed = JSON.parse(shareText);
      if (!parsed.cells)
        throw new Error("Invalid JSON");
      const newCells = parsed.cells.map((c, idx) => ({
        id: c.id || idx + 1,
        mode: c.mode || "r",
        source: c.source || "",
        output: c.mode === "markdown" ? { type: "markdown", html: renderMarkdown(c.source || "") } : null,
        mdPreview: c.mode === "markdown",
        showCode: true,
        showOutput: true
      }));
      setCells(newCells);
      setActiveCellId(newCells[0] ? newCells[0].id : 1);
      setShowShare(false);
    } catch (e) {
      alert("Invalid JSON");
    }
  }
  const [pkgInput, setPkgInput] = useState("");
  const [installedPackages, setInstalledPackages] = useState([...CORE_PACKAGES]);
  const [pkgWorking, setPkgWorking] = useState(null);
  const [dataFiles, setDataFiles] = useState([]);
  async function handleInstallPackage() {
    if (!canModifyNotebook)
      return;
    if (!webrInstance)
      return;
    if (pkgWorking)
      return;
    const pkg = (pkgInput || "").trim();
    if (!pkg)
      return;
    try {
      setBusy(true);
      setPkgWorking({ action: "install", pkg });
      setStatus(`Installing package '${pkg}'...`);
      await webrInstance.installPackages([pkg]);
      const ok = await webrInstance.evalRBoolean(`"${pkg}" %in% rownames(installed.packages())`);
      if (!ok) {
        setStatus(`Install failed: '${pkg}' is not available in this webR environment.`);
        alert(
          `\uD328\uD0A4\uC9C0 '${pkg}' \uC124\uCE58\uAC00 \uC644\uB8CC\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.
webR\uC740 WebAssembly\uB85C \uBBF8\uB9AC \uBE4C\uB4DC\uB41C \uD328\uD0A4\uC9C0\uB9CC \uC124\uCE58/\uB85C\uB529\uC774 \uAC00\uB2A5\uD574\uC11C,
'${pkg}'\uAC00 \uD604\uC7AC repo/\uD658\uACBD\uC5D0\uC11C \uC81C\uACF5\uB418\uC9C0 \uC54A\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.`
        );
        return;
      }
      setInstalledPackages((prev) => prev.includes(pkg) ? prev : [...prev, pkg].sort());
      setPkgInput("");
      setStatus(`Installed package '${pkg}'.`);
    } catch (e) {
      console.error(e);
      alert("Failed: " + (e && e.message ? e.message : String(e)));
      setStatus("Install failed");
    } finally {
      setPkgWorking(null);
      setBusy(false);
    }
  }
  async function handleRemovePackage(pkg) {
    if (!canModifyNotebook)
      return;
    if (!webrInstance)
      return;
    if (pkgWorking)
      return;
    if (CORE_PACKAGES.includes(pkg)) {
      alert("Cannot remove core package.");
      return;
    }
    if (!window.confirm(`Remove "${pkg}"?`))
      return;
    try {
      setBusy(true);
      setPkgWorking({ action: "remove", pkg });
      await webrInstance.evalRVoid(`if ("${pkg}" %in% rownames(installed.packages())) remove.packages("${pkg}")`);
    } catch (e) {
      console.warn(e);
    } finally {
      setPkgWorking(null);
      setBusy(false);
      setInstalledPackages((prev) => prev.filter((p) => p !== pkg));
      setStatus(`Removed '${pkg}'.`);
    }
  }
  function getDataFileExtension(name) {
    if (!name)
      return "";
    const lower = name.toLowerCase();
    const dot = lower.lastIndexOf(".");
    return dot === -1 ? "" : lower.slice(dot + 1);
  }
  function buildExampleCodeForDataFile(name, ext, rVar) {
    const varName = rVar || "df";
    const safeName = name || "data";
    const e = (ext || getDataFileExtension(safeName) || "").toLowerCase();
    if (e === "csv") {
      return `${varName} <- read.csv("${safeName}", header = TRUE)
${varName}`;
    }
    if (e === "txt") {
      return `${varName} <- read.table("${safeName}", header = TRUE)
${varName}`;
    }
    if (e === "rds") {
      return `${varName} <- readRDS("${safeName}")
${varName}`;
    }
    if (e === "xlsx" || e === "xls") {
      return `library(readxl)
${varName} <- read_excel("${safeName}")
${varName}`;
    }
    return `${varName} <- read.csv("${safeName}", header = TRUE)
${varName}`;
  }
  function createNewRCellWithSource(source) {
    setCells((prev) => {
      const newId = nextCellId();
      const next = [...prev, {
        id: newId,
        mode: "r",
        source,
        output: null,
        mdPreview: false,
        showCode: true,
        showOutput: true
      }];
      if (typeof syncCellIdSeqFromCells === "function")
        syncCellIdSeqFromCells(next);
      setActiveCellId(newId);
      return next;
    });
  }
  async function handleDataUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file || !webrInstance)
      return;
    (async () => {
      setBusy(true);
      setStatus("Uploading...");
      try {
        const existingNames = (dataFiles || []).map((f) => f && f.name ? f.name : null).filter(Boolean);
        const uniqueName = makeUniqueFilename(file.name, existingNames);
        const ext = getDataFileExtension(uniqueName);
        const existingVars = (dataFiles || []).map((f) => f && f.rVar ? f.rVar : null).filter(Boolean);
        const rVarBase = `df_${toSafeRVarBase(uniqueName)}`;
        const rVar = makeUniqueRVar(rVarBase, existingVars);
        const exampleCode = buildExampleCodeForDataFile(uniqueName, ext, rVar);
        const needPkgs = [];
        if (ext === "xlsx" || ext === "xls")
          needPkgs.push("readxl");
        const buffer = await file.arrayBuffer();
        const uint8 = new Uint8Array(buffer);
        webrInstance.FS.writeFile(uniqueName, uint8);
        const contentBase64 = uint8ToBase64(uint8);
        for (const pkg of needPkgs) {
          if (!installedPackages.includes(pkg)) {
            setInstalledPackages((prev) => prev.includes(pkg) ? prev : [...prev, pkg].sort());
          }
          try {
            await webrInstance.installPackages([pkg]);
          } catch (err) {
            console.warn("installPackages failed:", pkg, err);
          }
        }
        const newItem = {
          name: uniqueName,
          size: file.size,
          ext,
          rVar,
          exampleCode,
          // Save/Load 후 복원을 위해 파일 본문 저장
          contentBase64,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        setDataFiles((prev) => [...prev || [], newItem]);
        setStatus(`Uploaded '${uniqueName}'`);
      } catch (err) {
        console.error(err);
        alert("Upload failed: " + (err && err.message ? err.message : err));
        setStatus("Upload error");
      } finally {
        setBusy(false);
        try {
          e.target.value = "";
        } catch (_) {
        }
      }
    })();
  }
  async function handleRemoveDataFile(target) {
    if (!webrInstance)
      return;
    if (!window.confirm(`Delete '${target.name}'?`))
      return;
    try {
      webrInstance.FS.unlink(target.path);
    } catch (e) {
      console.warn(e);
    }
    setDataFiles((prev) => prev.filter((f) => f.path !== target.path));
  }
  function parseJsonSafe(v, fallback) {
    try {
      if (v === null || typeof v === "undefined")
        return fallback;
      if (typeof v === "string") {
        const t = v.trim();
        if (!t)
          return fallback;
        return JSON.parse(t);
      }
      return v;
    } catch (e) {
      return fallback;
    }
  }
  function normalizeInstalledPackageNames(value) {
    const list = Array.isArray(value) ? value : [];
    const names = list.map((entry) => {
      if (typeof entry === "string")
        return entry.trim();
      if (entry && typeof entry === "object")
        return String(entry.package || entry.name || "").trim();
      return "";
    }).filter(Boolean);
    return Array.from(new Set(names));
  }
  function restoreNotebookFromDbItem(item) {
    const title = item && item.title ? item.title : null;
    const mdList = parseJsonSafe(item && item.data_markdown, []);
    const rList = parseJsonSafe(item && item.data_rcode, []);
    const rrList = parseJsonSafe(item && item.data_rcode_result, []);
    const dataMgr = parseJsonSafe(item && item.data_data, []);
    const pkgList = normalizeInstalledPackageNames(parseJsonSafe(item && item.data_rpackage, []));
    const meta = parseJsonSafe(item && item.data_meta, {});
    try {
      if (meta && typeof meta.runtime_sessionInfo === "string" && meta.runtime_sessionInfo.trim().length) {
        setRuntimeSessionInfo(meta.runtime_sessionInfo);
        runtimeSessionInfoFromMetaRef.current = true;
      }
    } catch (e) {
    }
    function normalizeDataFiles(list) {
      const arr = Array.isArray(list) ? list : [];
      const out = [];
      const usedNames = /* @__PURE__ */ new Set();
      const usedVars = /* @__PURE__ */ new Set();
      for (const raw of arr) {
        let f = raw;
        if (typeof f === "string") {
          f = { name: f, path: f };
        }
        const name0 = f && (f.name || f.path) ? f.name || f.path : "unknown";
        const ext0 = f && f.ext ? f.ext : getDataFileExtension(name0);
        const uniqueName = makeUniqueFilename(name0, Array.from(usedNames));
        usedNames.add(uniqueName);
        const rVarBase = `df_${toSafeRVarBase(uniqueName)}`;
        const rVar = makeUniqueRVar(f && f.rVar ? f.rVar : rVarBase, Array.from(usedVars));
        usedVars.add(rVar);
        const contentBase64 = f && f.contentBase64 ? f.contentBase64 : null;
        const exampleCode = f && f.exampleCode ? f.exampleCode : buildExampleCodeForDataFile(uniqueName, ext0, rVar);
        out.push({
          name: uniqueName,
          path: uniqueName,
          size: f && f.size ? f.size : 0,
          ext: ext0,
          rVar,
          exampleCode,
          contentBase64
        });
      }
      return out;
    }
    if ((!mdList || !mdList.length) && (!rList || !rList.length) && meta && Array.isArray(meta.cells) && meta.cells.length) {
      const legacyCells = meta.cells;
      return {
        title,
        cells: legacyCells,
        activeCellId: meta.activeCellId || (legacyCells[0] ? legacyCells[0].id : 1),
        dataFiles: Array.isArray(meta.dataFiles) ? meta.dataFiles : [],
        installedPackages: normalizeInstalledPackageNames(meta.installedPackages)
      };
    }
    const mdById = new Map((Array.isArray(mdList) ? mdList : []).map((x) => [x.id, x.source || ""]));
    const rById = new Map((Array.isArray(rList) ? rList : []).map((x) => [x.id, x.source || ""]));
    const rrById = new Map((Array.isArray(rrList) ? rrList : []).map((x) => [x.id, x.output || null]));
    const order = Array.isArray(meta.cell_order) ? meta.cell_order : null;
    const ids = order && order.length ? order : Array.from(/* @__PURE__ */ new Set([...mdById.keys(), ...rById.keys()])).sort((a, b) => a - b);
    const restoredCells = ids.map((id) => {
      const mode = meta.cell_mode && meta.cell_mode[id] ? meta.cell_mode[id] : rById.has(id) ? "r" : "markdown";
      const source = mode === "markdown" ? mdById.get(id) || "" : rById.get(id) || "";
      const showCode = meta.cell_showCode && typeof meta.cell_showCode[id] !== "undefined" ? !!meta.cell_showCode[id] : true;
      const showOutput = meta.cell_showOutput && typeof meta.cell_showOutput[id] !== "undefined" ? !!meta.cell_showOutput[id] : true;
      const mdPreview = mode === "markdown" ? meta.cell_mdPreview && typeof meta.cell_mdPreview[id] !== "undefined" ? !!meta.cell_mdPreview[id] : true : false;
      let output = null;
      if (mode === "markdown") {
        output = { type: "markdown", html: renderMarkdown(source || "") };
      } else {
        const out = rrById.get(id);
        if (out && out.type === "text")
          output = { type: "text", text: out.text || "" };
        if (out && out.type === "image")
          output = { type: "image", src: out.src, inlineSize: out.inlineSize || "small", toggleSize: () => {
          } };
      }
      return { id, mode, source, output, mdPreview, showCode, showOutput };
    });
    const finalCells = restoredCells.map((c) => {
      if (c.output && c.output.type === "image") {
        c.output.toggleSize = () => {
          setCells(
            (prev) => prev.map((p) => {
              if (p.id !== c.id)
                return p;
              const sz = p.output.inlineSize === "large" ? "small" : "large";
              return { ...p, output: { ...p.output, inlineSize: sz } };
            })
          );
        };
      }
      return c;
    });
    return {
      title,
      cells: finalCells.length ? finalCells : null,
      activeCellId: meta && meta.activeCellId ? meta.activeCellId : finalCells[0] ? finalCells[0].id : 1,
      dataFiles: normalizeDataFiles(Array.isArray(dataMgr) ? dataMgr : []),
      installedPackages: pkgList
    };
  }
  function buildDbPartsFromNotebookState() {
    const data_markdown = cells.filter((c) => c.mode === "markdown").map((c) => ({ id: c.id, source: c.source || "" }));
    const data_rcode = cells.filter((c) => c.mode === "r").map((c) => ({ id: c.id, source: c.source || "" }));
    const data_rcode_result = cells.filter((c) => c.mode === "r").map((c) => {
      let output = null;
      if (c.output && c.output.type === "text")
        output = { type: "text", text: c.output.text || "" };
      if (c.output && c.output.type === "image")
        output = { type: "image", src: c.output.src, inlineSize: c.output.inlineSize || "small" };
      return { id: c.id, output };
    });
    const data_data = Array.isArray(dataFiles) ? dataFiles : [];
    const data_rpackage = Array.isArray(installedPackages) ? installedPackages.filter((p) => !CORE_PACKAGES.includes(p)) : [];
    const data_meta = {
      version: "split-v1",
      activeCellId,
      cell_order: cells.map((c) => c.id),
      cell_mode: Object.fromEntries(cells.map((c) => [c.id, c.mode])),
      cell_mdPreview: Object.fromEntries(cells.map((c) => [c.id, !!c.mdPreview])),
      cell_showCode: Object.fromEntries(cells.map((c) => [c.id, c.showCode !== false])),
      cell_showOutput: Object.fromEntries(cells.map((c) => [c.id, c.showOutput !== false])),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      runtime_sessionInfo: typeof runtimeSessionInfo === "string" ? runtimeSessionInfo : ""
    };
    return { data_markdown, data_rcode, data_rcode_result, data_data, data_rpackage, data_meta };
  }
  const pendingRuntimeRestoreRef = useRef(null);
  async function restoreRuntimeState(restored) {
    try {
      if (!webrInstance || !restored)
        return;
      const pkgs = Array.isArray(restored.installedPackages) ? restored.installedPackages : [];
      for (const pkg of pkgs) {
        if (!pkg)
          continue;
        try {
          await webrInstance.installPackages([pkg]);
        } catch (e) {
          console.warn("installPackages failed:", pkg, e);
        }
      }
      const files = Array.isArray(restored.dataFiles) ? restored.dataFiles : [];
      for (const f of files) {
        try {
          if (!f || !f.name)
            continue;
          if (!f.contentBase64)
            continue;
          const uint8 = base64ToUint8(f.contentBase64);
          webrInstance.FS.writeFile(f.name, uint8);
        } catch (e) {
          console.warn("restore file failed:", f && f.name, e);
        }
      }
    } catch (e) {
      console.warn("restoreRuntimeState error:", e);
    }
  }
  useEffect(() => {
    if (!webrInstance)
      return;
    const pending = pendingRuntimeRestoreRef.current;
    if (!pending)
      return;
    pendingRuntimeRestoreRef.current = null;
    (async () => {
      await restoreRuntimeState(pending);
    })();
  }, [webrInstance]);
  async function loadNotebookFromDB(nbid, { setStatusText = true } = {}) {
    if (!nbid) {
      if (isViewMode)
        setNotebookLoadState("error");
      return false;
    }
    try {
      setBusy(true);
      if (isViewMode)
        setNotebookLoadState("loading");
      if (setStatusText)
        setStatus("Loading...");
      const res = await apiLoadNotebook(nbid);
      if (!res || res.ok !== true || !res.item) {
        if (isViewMode)
          setNotebookLoadState("error");
        if (setStatusText)
          setStatus("Load failed");
        return false;
      }
      setCanEdit(!!res.can_edit || (!isViewMode && !notebookIdFromUrlRef.current));
      const restored = restoreNotebookFromDbItem(res.item);
      try {
        const _shareVal = res.item && res.item.share !== void 0 ? res.item.share : 0;
        const _shareValNum = _shareVal === 2 || _shareVal === "2" ? 2 : _shareVal === 1 || _shareVal === "1" || _shareVal === true ? 1 : 0;
        const _shareOn = _shareValNum > 0;
        setShareMode(_shareValNum);
        const _uuidShare = res.item && (res.item.uuid_share || res.item.uuidShare || res.item.uuidShareId) ? res.item.uuid_share || res.item.uuidShare || res.item.uuidShareId : "";
        setShareUUID(_shareOn ? String(_uuidShare || "") : "");
      } catch (e) {
      }
      if (restored.title)
        setNotebookTitle(restored.title);
      if (restored.cells && restored.cells.length) {
        setCells(restored.cells);
        syncCellIdSeqFromCells(restored.cells);
        setActiveCellId(restored.activeCellId || restored.cells[0].id);
      }
      if (restored.dataFiles)
        setDataFiles(restored.dataFiles);
      if (restored.installedPackages) {
        setInstalledPackages(Array.from(/* @__PURE__ */ new Set([...CORE_PACKAGES, ...restored.installedPackages])));
      }
      pendingRuntimeRestoreRef.current = restored;
      if (webrInstance) {
        await restoreRuntimeState(restored);
        pendingRuntimeRestoreRef.current = null;
      }
      if (setStatusText)
        setStatus("Loaded");
      if (isViewMode)
        setNotebookLoadState("loaded");
      showToast("\uBD88\uB7EC\uC624\uAE30 \uC644\uB8CC!");
      return true;
    } catch (e) {
      console.error(e);
      if (isViewMode)
        setNotebookLoadState("error");
      if (setStatusText)
        setStatus("Load error");
      return false;
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    const nbid = notebookIdFromUrlRef.current;
    if (!nbid)
      return;
    loadNotebookFromDB(nbid, { setStatusText: true });
  }, []);
  const rootClass = (isSiteMode ? "webr-notebook-site-app relative flex flex-col transition-colors duration-300 " : "flex flex-col h-full transition-colors duration-300 ") + (darkMode ? "bg-stone-900 text-stone-100 border-stone-800" : "bg-slate-100 text-slate-900 border-slate-200");
  const headerClass = "sticky top-0 z-20 w-full border-b backdrop-blur px-4 py-2 " + (isSiteMode ? "" : "shadow-sm ") + (darkMode ? "border-stone-800 bg-stone-950/95" : "border-slate-200 bg-white/95");
  const cellClass = "group relative rounded-2xl border shadow-sm transition-colors " + (darkMode ? "bg-stone-900/80 border-stone-800 hover:border-orange-500/80" : "bg-white border-slate-200 hover:border-orange-300/80 hover:shadow-md");
  const cellHeaderClass = "flex items-center justify-between px-3 py-2 border-b rounded-t-2xl " + (darkMode ? "border-stone-800/80 bg-stone-950/90" : "border-slate-200 bg-slate-50");
  const contentLayoutClass = isSiteMode ? "flex flex-col lg:flex-row items-start" : "flex flex-1 min-h-0 overflow-hidden";
  const mainClass = isSiteMode ? "w-full flex-1 px-4 py-4 md:px-6" : "flex-1 overflow-y-auto px-4 py-4 md:px-6";
  const sidebarClass = (darkMode ? "bg-slate-950 border-l border-slate-800" : "bg-slate-50 border-l border-slate-200") + " w-72 flex-shrink-0 px-3 py-4 text-[12px] " + (isDesktop ? sidebarOpen ? isSiteMode ? "relative z-0 block self-stretch" : "relative z-0 block overflow-y-auto" : "hidden" : (isSiteMode ? "absolute" : "fixed") + " z-40 right-0 bottom-0 overflow-y-auto shadow-2xl transition-transform duration-200 " + (sidebarOpen ? "translate-x-0" : "translate-x-full"));
  const statusBadgeClass = isViewMode ? "bg-blue-100 text-blue-700" : ready ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700";
  const statusBadgeText = isViewMode ? "\uC77D\uAE30 \uBAA8\uB4DC" : ready ? "Ready" : "Starting WebR...";
  const canOpenEditMode = isViewMode && canEdit && !!notebookIdFromUrlRef.current;
  const editModeHref = canOpenEditMode ? "/webr/notebook/run/" + encodeURIComponent(notebookIdFromUrlRef.current) + "/" + (isSiteMode ? "" : "?mode=focus") : "";
  const notebookLoadBlocking = isViewMode && !!notebookIdFromUrlRef.current && notebookLoadState !== "loaded";
  const notebookLoadFailed = notebookLoadState === "error";
  const notebookLoadTitle = notebookLoadFailed ? "Notebook\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4" : "Notebook \uBCF8\uBB38\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4";
  const notebookLoadText = notebookLoadFailed ? "\uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694." : "\uC800\uC7A5\uB41C Notebook \uB0B4\uC6A9\uC744 \uC900\uBE44\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.";
  return /* @__PURE__ */ React.createElement("div", { className: rootClass }, /* @__PURE__ */ React.createElement("header", { ref: headerRef, className: headerClass }, /* @__PURE__ */ React.createElement("div", { className: "flex w-full flex-col gap-2 lg:flex-row lg:items-center lg:justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex w-full items-center justify-between gap-2 lg:w-auto lg:justify-start" }, /* @__PURE__ */ React.createElement("div", { className: "flex min-w-0 items-center gap-3" }, !isSiteMode && /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "/webr/notebook/",
      className: "flex min-w-0 items-center gap-2 cursor-pointer select-none",
      title: "Back to /webr/notebook/"
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex h-7 w-7 flex-none items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white" }, "R"),
    /* @__PURE__ */ React.createElement("div", { className: "flex min-w-0 flex-col leading-tight" }, /* @__PURE__ */ React.createElement("span", { className: "truncate text-[13px] font-semibold tracking-tight" }, "WEB-R NOTEBOOK"), /* @__PURE__ */ React.createElement("span", { className: "truncate text-[11px] text-slate-400" }, "Browser-based R Notebook"))
  ), /* @__PURE__ */ React.createElement(
    "span",
    {
      className: "rounded-full px-2 py-0.5 text-[11px] font-medium " + statusBadgeClass
    },
    statusBadgeText
  ), /* @__PURE__ */ React.createElement(
    "span",
    {
      className: "hidden sm:flex items-center gap-1 text-[11px] text-amber-400 transition-opacity " + (busy ? "opacity-100" : "opacity-0 pointer-events-none"),
      style: { minWidth: 92 }
    },
    /* @__PURE__ */ React.createElement("span", { className: "h-2 w-2 rounded-full bg-amber-400 " + (busy ? "animate-ping" : "") }),
    "Running..."
  )), !isSiteMode && /* @__PURE__ */ React.createElement("div", { className: "flex flex-none items-center gap-2 lg:hidden" }, authLoading ? /* @__PURE__ */ React.createElement("span", { className: "rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-500 dark:border-slate-600" }, "Checking...") : authUser ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] dark:border-slate-700 dark:bg-slate-950" }, /* @__PURE__ */ React.createElement("span", { className: "text-orange-500" }, "\u25CF"), /* @__PURE__ */ React.createElement("div", { className: "leading-tight" }, /* @__PURE__ */ React.createElement("div", { className: "font-semibold text-slate-800 dark:text-slate-100" }, authUser.nickname || authUser.name || (authUser.email ? authUser.email.split("@")[0] : "User")), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-400" }, authUser.is_staff ? "\uAD00\uB9AC\uC790" : "\uD68C\uC6D0"))), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      disabled: authWorking,
      onClick: async () => {
        try {
          setAuthWorking(true);
          await apiLogout();
          await refreshAuth();
        } catch (e) {
          location.href = "/account/logout/";
          return;
        } finally {
          setAuthWorking(false);
        }
      },
      className: "rounded-full px-3 py-1 text-[11px] font-medium text-white " + (authWorking ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-slate-800")
    },
    "Logout"
  )) : /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      disabled: authWorking,
      onClick: () => setShowLogin(true),
      className: "rounded-full px-3 py-1 text-[11px] font-medium " + (authWorking ? "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800" : "bg-orange-500 text-white hover:bg-orange-600")
    },
    "Login"
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex w-full flex-wrap items-center gap-2 text-[12px] lg:w-auto lg:justify-end" }, !sidebarOpen && /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setSidebarOpen((v) => !v),
      className: "inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800",
      title: "Package/Data Sidebar"
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-medium" }, "Tools")
  ), !isSiteMode && /* @__PURE__ */ React.createElement(
    "a",
    {
      href: notebookModeHref("site"),
      className: "inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800",
      title: "Web-R 기본 화면으로 돌아가기"
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-medium" }, "\uAE30\uBCF8 \uBAA8\uB4DC")
  ), canOpenEditMode && /* @__PURE__ */ React.createElement(
    "a",
    {
      href: editModeHref,
      className: "inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700",
      title: "\uC791\uC131\uC790 \uD3B8\uC9D1 \uBAA8\uB4DC\uB85C \uC774\uB3D9"
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-medium" }, "\uD3B8\uC9D1 \uBAA8\uB4DC")
  ), canModifyNotebook && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: handleNewNotebook,
      title: "New notebook (Ctrl/Cmd+Alt+N)",
      className: "inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-medium" }, "New")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: handleSaveNotebook,
      title: "Save notebook (Ctrl/Cmd+S)",
      className: "inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-medium" }, "Save")
  )), !isViewMode && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setShowHelp(true),
      title: "Help (F1 or Ctrl/Cmd+Alt+H)",
      className: "inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-medium" }, "Help")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: handleShare,
      title: "Share notebook (Ctrl/Cmd+Alt+S)",
      className: "inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-medium" }, "Share")
  )), canModifyNotebook && /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: handleRunAll,
      disabled: !ready || busy,
      className: "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium " + (ready && !busy ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-slate-300 text-slate-500 cursor-not-allowed")
    },
    "\u25B6 Run All"
  ), /* @__PURE__ */ React.createElement(
    "span",
    {
      className: "flex sm:hidden items-center gap-1 text-[11px] text-amber-400 transition-opacity " + (busy ? "opacity-100" : "opacity-0 pointer-events-none")
    },
    /* @__PURE__ */ React.createElement("span", { className: "h-2 w-2 rounded-full bg-amber-400 " + (busy ? "animate-ping" : "") }),
    "Running..."
  ), !isSiteMode && /* @__PURE__ */ React.createElement("div", { className: "hidden lg:flex items-center gap-2 ml-2" }, authLoading ? /* @__PURE__ */ React.createElement("span", { className: "rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-500 dark:border-slate-600" }, "Checking...") : authUser ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] dark:border-slate-700 dark:bg-slate-950" }, /* @__PURE__ */ React.createElement("span", { className: "text-orange-500" }, "\u25CF"), /* @__PURE__ */ React.createElement("div", { className: "leading-tight" }, /* @__PURE__ */ React.createElement("div", { className: "font-semibold text-slate-800 dark:text-slate-100" }, authUser.nickname || authUser.name || (authUser.email ? authUser.email.split("@")[0] : "User")), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-400" }, authUser.is_staff ? "\uAD00\uB9AC\uC790" : "\uD68C\uC6D0"))), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      disabled: authWorking,
      onClick: async () => {
        try {
          setAuthWorking(true);
          await apiLogout();
          await refreshAuth();
        } catch (e) {
          location.href = "/account/logout/";
          return;
        } finally {
          setAuthWorking(false);
        }
      },
      className: "rounded-full px-3 py-1 text-[11px] font-medium text-white " + (authWorking ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-slate-800")
    },
    "Logout"
  )) : /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      disabled: authWorking,
      onClick: () => setShowLogin(true),
      className: "rounded-full px-3 py-1 text-[11px] font-medium " + (authWorking ? "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800" : "bg-orange-500 text-white hover:bg-orange-600")
    },
    "Login"
  ))))), toast && /* @__PURE__ */ React.createElement("div", { className: isSiteMode ? "absolute top-3 right-3 z-40" : "fixed top-16 right-4 z-50" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "rounded-xl border px-4 py-2 text-sm shadow-lg backdrop-blur " + (toast.kind === "ok" ? darkMode ? "border-emerald-700 bg-emerald-900/60 text-emerald-100" : "border-emerald-200 bg-emerald-50 text-emerald-800" : darkMode ? "border-rose-700 bg-rose-900/60 text-rose-100" : "border-rose-200 bg-rose-50 text-rose-800")
    },
    toast.message
  )), notebookLoadBlocking && /* @__PURE__ */ React.createElement("div", { className: (isSiteMode ? "absolute" : "fixed") + " inset-0 z-30 flex items-center justify-center bg-slate-100/90 px-4 backdrop-blur-sm" }, /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-md rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-xl" }, /* @__PURE__ */ React.createElement("div", { className: "mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" }), /* @__PURE__ */ React.createElement("div", { className: "text-base font-semibold text-slate-950" }, notebookLoadTitle), /* @__PURE__ */ React.createElement("div", { className: "mt-2 text-sm leading-6 text-slate-500" }, notebookLoadText))), /* @__PURE__ */ React.createElement("div", { className: contentLayoutClass }, /* @__PURE__ */ React.createElement("main", { className: mainClass }, /* @__PURE__ */ React.createElement("div", { className: "mb-3 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex min-w-0 flex-1 items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: notebookTitle,
      readOnly: !canModifyNotebook,
      onChange: (e) => {
        if (canModifyNotebook)
          setNotebookTitle(e.target.value);
      },
      className: "w-full max-w-[420px] rounded-lg border px-3 py-1 text-sm " + (darkMode ? "border-slate-700 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900") + (!canModifyNotebook ? " opacity-70 cursor-not-allowed" : "")
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-slate-400" }, status))), /* @__PURE__ */ React.createElement("div", { className: "space-y-4 pb-8" }, cells.map((cell) => /* @__PURE__ */ React.createElement(
    "section",
    {
      key: cell.id,
      className: cellClass + (activeCellId === cell.id ? " ring-2 ring-orange-400/70" : ""),
      onClick: () => setActiveCellId(cell.id)
    },
    /* @__PURE__ */ React.createElement("div", { className: cellHeaderClass }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-[12px]" }, /* @__PURE__ */ React.createElement(
      "span",
      {
        className: "rounded-full px-2 py-0.5 text-[11px] " + (darkMode ? "bg-slate-800 text-slate-200" : "bg-white text-slate-700 border border-slate-200")
      },
      "In [",
      cell.id,
      "]"
    ), /* @__PURE__ */ React.createElement("div", { className: "inline-flex items-center rounded-full bg-slate-900/5 p-0.5 dark:bg-slate-800/60" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          if (!canModifyNotebook)
            return;
          setCells((prev) => prev.map((c) => c.id === cell.id ? { ...c, mode: "r" } : c));
        },
        className: "px-2 py-0.5 text-[11px] rounded-full " + (cell.mode === "r" ? "bg-orange-500 text-white" : "text-slate-500")
      },
      "R Code"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          if (!canModifyNotebook)
            return;
          setCells((prev) => prev.map((c) => c.id === cell.id ? { ...c, mode: "markdown" } : c));
        },
        className: "px-2 py-0.5 text-[11px] rounded-full " + (cell.mode === "markdown" ? "bg-orange-500 text-white" : "text-slate-500")
      },
      "Markdown (LaTeX)"
    ))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 text-[11px]" }, canModifyNotebook && /* @__PURE__ */ React.createElement(React.Fragment, null, cell.mode === "r" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => runRCell(cell.id, false),
        disabled: !ready || busy,
        className: "inline-flex items-center rounded-full px-2 py-0.5 " + (ready ? "text-orange-500 hover:bg-orange-50 dark:hover:bg-slate-800" : "text-slate-400 cursor-not-allowed")
      },
      "\u25B6 Run"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => runRCell(cell.id, true),
        disabled: !ready || busy,
        className: "inline-flex items-center rounded-full px-2 py-0.5 " + (ready ? "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" : "text-slate-400 cursor-not-allowed")
      },
      "\u25B6 + Cell"
    )), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => moveCell(cell.id, "up"),
        className: "inline-flex items-center rounded-full px-1.5 py-0.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
      },
      "\u2191"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => moveCell(cell.id, "down"),
        className: "inline-flex items-center rounded-full px-1.5 py-0.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
      },
      "\u2193"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => deleteCell(cell.id),
        className: "inline-flex items-center rounded-full px-2 py-0.5 text-red-400 hover:bg-red-50 dark:hover:bg-slate-800"
      },
      "\u2715"
    )))),
    /* @__PURE__ */ React.createElement("div", { className: "px-4 py-3" }, cell.mode === "markdown" ? cell.mdPreview ? /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "markdown-body prose prose-sm max-w-none rounded-xl border px-3 py-2 text-sm " + (darkMode ? "border-slate-800 bg-slate-900 text-slate-100" : "border-slate-200 bg-slate-50 text-slate-800")
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2 text-[11px] text-slate-400" }, /* @__PURE__ */ React.createElement("span", null, "Markdown Preview (LaTeX \uC218\uC2DD \uC9C0\uC6D0)"), canModifyNotebook && /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => setCells((prev) => prev.map((c) => c.id === cell.id ? { ...c, mdPreview: false } : c)),
          className: "rounded-full border border-slate-300 px-2 py-0.5 text-[11px] hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
        },
        "Edit Markdown"
      )),
      /* @__PURE__ */ React.createElement(
        MarkdownRendered,
        {
          html: cell.output && cell.output.type === "markdown" ? cell.output.html : renderMarkdown(cell.source)
        }
      )
    ) : /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "mb-1 flex items-center justify-between text-[11px] text-slate-400" }, /* @__PURE__ */ React.createElement("span", null, "Markdown Editor (LaTeX \uC218\uC2DD \uC9C0\uC6D0)"), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => runMarkdownCell(cell.id),
        className: "rounded-full border border-slate-300 px-2 py-0.5 text-[11px] hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
      },
      "Preview Markdown"
    )), /* @__PURE__ */ React.createElement(
      RCodeEditor,
      {
        value: cell.source,
        onChange: (v) => setCells((prev) => prev.map((c) => c.id === cell.id ? { ...c, source: v } : c)),
        darkMode,
        cellId: cell.id,
        mode: "markdown",
        onFocus: () => setActiveCellId(cell.id),
        readOnly: !canModifyNotebook
      }
    )) : (
      // R Code 모드
      /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "mb-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500" }, canModifyNotebook && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => setCells(
            (prev) => prev.map(
              (c) => c.id === cell.id ? { ...c, showCode: c.showCode === false ? true : !c.showCode } : c
            )
          ),
          className: "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 " + (darkMode ? "border-slate-700 hover:bg-slate-800" : "border-slate-300 hover:bg-slate-100")
        },
        /* @__PURE__ */ React.createElement("span", null, cell.showCode === false ? "\u25B6" : "\u25BC"),
        /* @__PURE__ */ React.createElement("span", null, "Code")
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => setCells(
            (prev) => prev.map(
              (c) => c.id === cell.id ? { ...c, showOutput: c.showOutput === false ? true : !c.showOutput } : c
            )
          ),
          className: "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 " + (darkMode ? "border-slate-700 hover:bg-slate-800" : "border-slate-300 hover:bg-slate-100")
        },
        /* @__PURE__ */ React.createElement("span", null, cell.showOutput === false ? "\u25B6" : "\u25BC"),
        /* @__PURE__ */ React.createElement("span", null, "Output")
      ))), cell.showCode !== false && /* @__PURE__ */ React.createElement(
        RCodeEditor,
        {
          value: cell.source,
          onChange: (v) => setCells((prev) => prev.map((c) => c.id === cell.id ? { ...c, source: v } : c)),
          darkMode,
          cellId: cell.id,
          mode: "r",
          onFocus: () => setActiveCellId(cell.id),
          readOnly: !canModifyNotebook
        }
      ))
    ), cell.mode === "r" && cell.showOutput !== false && /* @__PURE__ */ React.createElement(CellOutput, { output: cell.output, darkMode }))
  )), canModifyNotebook && /* @__PURE__ */ React.createElement("div", { className: "flex justify-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => addCellBelow(cells[cells.length - 1].id),
      className: "inline-flex items-center gap-2 rounded-full border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-500 hover:border-orange-400 hover:text-orange-500 dark:border-slate-600 dark:hover:border-orange-400"
    },
    "+ New Cell"
  )))), !isDesktop && sidebarOpen && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-30 bg-black/40", onClick: () => setSidebarOpen(false) }), /* @__PURE__ */ React.createElement(
    "aside",
    {
      className: sidebarClass,
      style: !isDesktop ? { top: headerH } : void 0
    },
    /* @__PURE__ */ React.createElement("div", { className: "mb-3 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "text-[12px] font-semibold text-slate-600 dark:text-slate-200" }, !isDesktop ? "TOOLS" : ""), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setSidebarOpen(false),
        className: "inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-[16px] leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:border-slate-600 dark:hover:bg-slate-800",
        title: "Hide tools",
        "aria-label": "Hide tools"
      },
      "\u00D7"
    )),
    /* @__PURE__ */ React.createElement("section", { className: "mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "mb-2 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h2", { className: "text-[12px] font-semibold text-slate-600 dark:text-slate-200" }, "PACKAGE MANAGER")), canModifyNotebook ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "mb-2 flex gap-1" }, /* @__PURE__ */ React.createElement("input", { type: "text", placeholder: "e.g. dplyr", value: pkgInput, onChange: (e) => setPkgInput(e.target.value), onKeyDown: (e) => {
      if (e.key === "Enter" && !e.isComposing) {
        e.preventDefault();
        handleInstallPackage();
      }
    }, disabled: !!pkgWorking, className: "flex-1 rounded-lg border px-2 py-1 text-xs " + (pkgWorking ? "cursor-wait opacity-70 " : "") + (darkMode ? "border-slate-700 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900") }), /* @__PURE__ */ React.createElement("button", { type: "button", disabled: !!pkgWorking, onClick: handleInstallPackage, className: "inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1 text-xs font-medium text-white " + (pkgWorking ? "cursor-wait bg-orange-400" : "bg-orange-500 hover:bg-orange-600") }, pkgWorking && pkgWorking.action === "install" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "h-3 w-3 animate-spin rounded-full border-2 border-white/80 border-t-transparent" }), "Adding") : "Add")), pkgWorking ? /* @__PURE__ */ React.createElement("div", { className: "mb-2 inline-flex items-center gap-2 text-[11px] text-slate-500" }, /* @__PURE__ */ React.createElement("span", { className: "h-3 w-3 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" }), pkgWorking.action === "remove" ? `Removing ${pkgWorking.pkg}...` : `Installing ${pkgWorking.pkg}...`) : null) : /* @__PURE__ */ React.createElement("div", { className: "mb-2 text-[11px] text-slate-400" }, "View mode: packages are read-only."), /* @__PURE__ */ React.createElement("div", { className: "mb-2 flex flex-wrap gap-1" }, POPULAR_PACKAGES.map((pkg) => /* @__PURE__ */ React.createElement("button", { key: pkg, type: "button", disabled: !!pkgWorking, onClick: () => setPkgInput(pkg), className: "rounded-full px-2 py-0.5 text-[11px] " + (pkgWorking ? "cursor-wait bg-slate-100 text-slate-400" : "bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600 dark:bg-slate-800 dark:text-slate-300") }, pkg))), /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border text-[11px] " + (darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white") }, /* @__PURE__ */ React.createElement("div", { className: "border-b px-2 py-1.5 text-[11px] text-slate-400 dark:border-slate-800" }, "INSTALLED PACKAGES"), /* @__PURE__ */ React.createElement("ul", { className: "max-h-40 overflow-y-auto px-2 py-1.5 space-y-0.5" }, installedPackages.map((pkg) => {
      const isRemoving = pkgWorking && pkgWorking.action === "remove" && pkgWorking.pkg === pkg;
      return /* @__PURE__ */ React.createElement("li", { key: pkg, className: "flex items-center justify-between py-0.5" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-600 dark:text-slate-200" }, pkg), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 text-[10px] " + (isRemoving ? "text-orange-500" : "text-emerald-500") }, isRemoving && /* @__PURE__ */ React.createElement("span", { className: "h-2.5 w-2.5 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" }), CORE_PACKAGES.includes(pkg) ? "core" : isRemoving ? "removing" : "ready"), canModifyNotebook && !CORE_PACKAGES.includes(pkg) && /* @__PURE__ */ React.createElement("button", { type: "button", disabled: !!pkgWorking, onClick: () => handleRemovePackage(pkg), className: "inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] " + (pkgWorking ? "cursor-wait text-slate-300" : "text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-slate-800"), title: "Remove package" }, isRemoving ? /* @__PURE__ */ React.createElement("span", { className: "h-3 w-3 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" }) : "\u2715")));
    })))),
    /* @__PURE__ */ React.createElement("section", { className: "mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "mb-2 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h2", { className: "text-[12px] font-semibold text-slate-600 dark:text-slate-200" }, "DATA MANAGER")), canModifyNotebook && /* @__PURE__ */ React.createElement("label", { className: "mb-2 inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-300 px-2 py-2 text-[11px] text-slate-500 hover:border-orange-400 hover:text-orange-500 dark:border-slate-700 dark:hover:border-orange-400" }, /* @__PURE__ */ React.createElement("span", null, "CSV / RDS / XLSX / TXT Upload"), /* @__PURE__ */ React.createElement("input", { type: "file", accept: ".csv,.rds,.txt,.xlsx,.xls", className: "hidden", onChange: handleDataUpload })), /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border text-[11px] " + (darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white") }, /* @__PURE__ */ React.createElement("div", { className: "border-b px-2 py-1.5 text-[11px] text-slate-400 dark:border-slate-800" }, "UPLOADED FILES"), dataFiles.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "px-2 py-2 text-[11px] text-slate-400" }, "No files yet.") : /* @__PURE__ */ React.createElement("ul", { className: "max-h-40 overflow-y-auto px-2 py-1.5 space-y-1" }, dataFiles.map((f) => /* @__PURE__ */ React.createElement("li", { key: f.path, className: "flex flex-col gap-0.5 text-[11px]" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-800 dark:text-slate-100" }, f.name), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      if (!canModifyNotebook)
        return;
      handleRemoveDataFile(f);
    }, className: "rounded-full px-1 text-[11px] text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-slate-800" }, "\u2715")), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-400" }, (f.size / 1024).toFixed(1), " KB"), f.exampleCode && /* @__PURE__ */ React.createElement("div", { className: "mt-1 rounded-lg border px-2 py-1 font-mono " + (darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-slate-50") }, /* @__PURE__ */ React.createElement("div", { className: "mb-1 flex items-center justify-between text-[10px] text-slate-500" }, /* @__PURE__ */ React.createElement("span", null, "Example Code"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => createNewRCellWithSource(f.exampleCode), className: "rounded-full border px-2 py-0.5 text-[10px] hover:bg-orange-50 dark:border-slate-600 dark:hover:bg-slate-800" }, "+ Cell")), /* @__PURE__ */ React.createElement("pre", { className: "whitespace-pre-wrap text-[10px] leading-snug" }, f.exampleCode)))))), /* @__PURE__ */ React.createElement("section", { className: "mb-2" }, /* @__PURE__ */ React.createElement("div", { className: "mb-2 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h2", { className: "text-[12px] font-semibold text-slate-600 dark:text-slate-200" }, "RUNTIME (sessionInfo)"), !isViewMode && /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          if (webrInstance)
            fetchRuntimeSessionInfo(webrInstance);
        },
        className: "rounded-full border border-slate-300 px-2 py-0.5 text-[10px] text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
        title: "Refresh runtime info"
      },
      "Refresh"
    )), /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border text-[11px] " + (darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white") }, /* @__PURE__ */ React.createElement("div", { className: "border-b px-2 py-1.5 text-[11px] text-slate-400 dark:border-slate-800" }, isViewMode ? "View mode" : ready ? "WebR ready" : "Starting..."), runtimeSessionInfoError ? /* @__PURE__ */ React.createElement("div", { className: "px-2 py-2 text-[11px] text-rose-500" }, runtimeSessionInfoError) : null, /* @__PURE__ */ React.createElement("pre", { className: "px-2 py-2 whitespace-pre-wrap break-words font-mono " + (darkMode ? "text-slate-100" : "text-slate-800") }, runtimeSessionInfo || (isViewMode ? "Runtime not started in view mode." : "Loading...")))))
  )), showHelp && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-40 flex items-center justify-center bg-black/40", onClick: (e) => {
    if (e.target === e.currentTarget)
      setShowHelp(false);
  } }, /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-lg rounded-2xl border p-4 text-sm " + (darkMode ? "border-slate-700 bg-slate-950 text-slate-100" : "border-slate-200 bg-white text-slate-800") }, /* @__PURE__ */ React.createElement("div", { className: "mb-2 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h2", { className: "text-sm font-semibold" }, "Web-R Notebook Help"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setShowHelp(false), className: "text-slate-400 hover:text-slate-600" }, "\u2715")), /* @__PURE__ */ React.createElement("div", { className: "space-y-2 text-[12px]" }, /* @__PURE__ */ React.createElement("p", { className: "font-medium" }, "Keyboard Shortcuts"), /* @__PURE__ */ React.createElement("ul", { className: "list-disc pl-5 space-y-1" }, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "Ctrl+S"), " / ", /* @__PURE__ */ React.createElement("strong", null, "Cmd+S"), ": Save notebook"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "Ctrl+Alt+N"), " / ", /* @__PURE__ */ React.createElement("strong", null, "Cmd+Alt+N"), ": New notebook"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "Ctrl+Alt+H"), " / ", /* @__PURE__ */ React.createElement("strong", null, "Cmd+Alt+H"), " / ", /* @__PURE__ */ React.createElement("strong", null, "F1"), ": Help"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "Ctrl+Alt+S"), " / ", /* @__PURE__ */ React.createElement("strong", null, "Cmd+Alt+S"), ": Share notebook"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "Ctrl+Enter"), " / ", /* @__PURE__ */ React.createElement("strong", null, "Cmd+Enter"), ": Run current cell"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "Ctrl+Shift+Enter"), " / ", /* @__PURE__ */ React.createElement("strong", null, "Cmd+Shift+Enter"), ": Run cell + insert below"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "Alt+Enter"), ": Insert new R Code cell below"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "Ctrl+Alt+Enter"), " / ", /* @__PURE__ */ React.createElement("strong", null, "Cmd+Alt+Enter"), ": Run all cells"))))), showShare && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-40 flex items-center justify-center bg-black/40", onClick: (e) => {
    if (e.target === e.currentTarget)
      setShowShare(false);
  } }, /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-xl rounded-2xl border p-4 text-sm " + (darkMode ? "border-slate-700 bg-slate-950 text-slate-100" : "border-slate-200 bg-white text-slate-800") }, /* @__PURE__ */ React.createElement("div", { className: "mb-2 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h2", { className: "text-sm font-semibold" }, "Share Notebook"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setShowShare(false), className: "text-slate-400 hover:text-slate-600", "aria-label": "Close share dialog" }, "\u2715")), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 text-[12px]" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-800" }, "\uD604\uC7AC \uC0C1\uD0DC: "), shareMode === 1 ? "\uCEE4\uBBA4\uB2C8\uD2F0\uC5D0 \uACF5\uC720" : shareMode === 2 ? "\uB9C1\uD06C\uB85C\uB9CC \uACF5\uC720" : "\uBE44\uACF5\uAC1C"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-2 sm:flex-row", role: "radiogroup", "aria-label": "Notebook sharing mode" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      role: "radio",
      "aria-checked": shareMode === 0,
      disabled: busy || shareWorking !== null,
      onClick: () => handleSetShareMode(0),
      className: "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold " + (shareMode === 0 ? "border-slate-800 bg-slate-800 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50") + (busy || shareWorking !== null ? " cursor-wait opacity-80" : "")
    },
    shareWorking === 0 ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" }), "OFF") : "\u25CF OFF"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      role: "radio",
      "aria-checked": shareMode === 2,
      disabled: busy || shareWorking !== null,
      onClick: () => handleSetShareMode(2),
      className: "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold " + (shareMode === 2 ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50") + (busy || shareWorking !== null ? " cursor-wait opacity-80" : "")
    },
    shareWorking === 2 ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" }), "\uB9C1\uD06C\uB85C\uB9CC \uACF5\uC720") : "\u25CF \uB9C1\uD06C\uB85C\uB9CC \uACF5\uC720"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      role: "radio",
      "aria-checked": shareMode === 1,
      disabled: busy || shareWorking !== null,
      onClick: () => handleSetShareMode(1),
      className: "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold " + (shareMode === 1 ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50") + (busy || shareWorking !== null ? " cursor-wait opacity-80" : "")
    },
    shareWorking === 1 ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" }), "\uCEE4\uBBA4\uB2C8\uD2F0\uC5D0 \uACF5\uC720") : "\u25CF \uCEE4\uBBA4\uB2C8\uD2F0\uC5D0 \uACF5\uC720"
  )), shareWorking !== null ? /* @__PURE__ */ React.createElement("div", { className: "inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] font-medium text-blue-700" }, /* @__PURE__ */ React.createElement("span", { className: "h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" }), shareWorking === 0 ? "\uACF5\uC720\uB97C \uB044\uB294 \uC911..." : shareWorking === 2 ? "\uB9C1\uD06C \uACF5\uC720\uB85C \uBC14\uAFB8\uB294 \uC911..." : "\uCEE4\uBBA4\uB2C8\uD2F0 \uACF5\uC720\uB85C \uBC14\uAFB8\uB294 \uC911...") : null, shareEnabled && shareUUID ? /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border px-3 py-2 text-[11px] " + (darkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-50") }, /* @__PURE__ */ React.createElement("div", { className: "mb-1 text-slate-400" }, "View link"), /* @__PURE__ */ React.createElement("div", { className: "mb-2 text-[11px] text-slate-400" }, shareMode === 1 ? "\uACF5\uAC1C \uBC94\uC704: \uCEE4\uBBA4\uB2C8\uD2F0" : shareMode === 2 ? "\uACF5\uAC1C \uBC94\uC704: \uB9C1\uD06C \uBCF4\uC720\uC790" : ""), /* @__PURE__ */ React.createElement("div", { className: "break-all font-mono" }, `${location.origin}/webr/notebook/view/${shareUUID}/`), /* @__PURE__ */ React.createElement("div", { className: "mt-2" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => navigator.clipboard.writeText(`${location.origin}/webr/notebook/view/${shareUUID}/`).then(() => showToast("Copied")), className: "rounded-full bg-slate-800 px-3 py-1 text-xs text-white hover:bg-slate-700" }, "Copy Link"))) : /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-400" }, "\uB9C1\uD06C \uB610\uB294 \uCEE4\uBBA4\uB2C8\uD2F0 \uACF5\uC720\uB97C \uCF1C\uBA74 view link\uAC00 \uC0DD\uC131\uB429\uB2C8\uB2E4.")))), showLogin && /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-4",
      onMouseDown: (e) => {
        if (e.target === e.currentTarget)
          setShowLogin(false);
      }
    },
    /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-md rounded-2xl border p-5 shadow-2xl " + (darkMode ? "border-slate-700 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-800") }, /* @__PURE__ */ React.createElement("div", { className: "mb-2 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h2", { className: "text-sm font-semibold" }, "Web-R \uACC4\uC815"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setShowLogin(false), className: "text-slate-400 hover:text-slate-600" }, "\u2715")), /* @__PURE__ */ React.createElement("div", { className: "mb-3 flex gap-2 text-[12px]" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      setLoginTab("signin");
      setAuthError("");
    }, className: "px-3 py-1 rounded-full border " + (loginTab === "signin" ? "bg-slate-200/20" : "") }, "\uB85C\uADF8\uC778"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      setLoginTab("signup");
      setAuthError("");
    }, className: "px-3 py-1 rounded-full border " + (loginTab === "signup" ? "bg-slate-200/20" : "") }, "\uD68C\uC6D0\uAC00\uC785"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      setLoginTab("forgot");
      setAuthError("");
      setForgotStep(1);
    }, className: "px-3 py-1 rounded-full border " + (loginTab === "forgot" ? "bg-slate-200/20" : "") }, "\uBE44\uBC00\uBC88\uD638 \uCC3E\uAE30")), authError && /* @__PURE__ */ React.createElement("div", { className: "mb-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-[11px] text-red-700" }, authError), loginTab === "signin" && /* @__PURE__ */ React.createElement(
      "form",
      {
        className: "space-y-3 text-[12px]",
        onSubmit: async (e) => {
          e.preventDefault();
          setAuthError("");
          if (!loginAccount || !loginPassword) {
            setAuthError("\uC774\uBA54\uC77C(ID)\uACFC \uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.");
            return;
          }
          setAuthWorking(true);
          try {
            const r = await apiLogin(loginAccount, loginPassword);
            if (r && r.result === "ok") {
              await refreshAuth();
              setShowLogin(false);
            } else {
              setAuthError(r && (r.err || r.msg) ? r.err || r.msg : "\uB85C\uADF8\uC778\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
            }
          } catch (err) {
            setAuthError(err && err.message ? err.message : "\uB85C\uADF8\uC778\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
          } finally {
            setAuthWorking(false);
          }
        }
      },
      googleClientID && googleLoginNonce ? /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("div", { ref: googleButtonRef, className: "flex min-h-[44px] w-full items-center justify-center" }), googleLoginStatus ? /* @__PURE__ */ React.createElement("div", { className: "rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] text-blue-700" }, googleLoginStatus) : null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-[10px] text-slate-400" }, /* @__PURE__ */ React.createElement("span", { className: "h-px flex-1 bg-slate-200" }), /* @__PURE__ */ React.createElement("span", null, "\uB610\uB294"), /* @__PURE__ */ React.createElement("span", { className: "h-px flex-1 bg-slate-200" }))) : null,
      /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] text-slate-500" }, "\uC774\uBA54\uC77C(ID)"), /* @__PURE__ */ React.createElement("input", { type: "text", value: loginAccount, onChange: (e) => setLoginAccount(e.target.value), className: "w-full rounded-xl border px-3 py-2 outline-none " + (darkMode ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-white") })),
      /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] text-slate-500" }, "\uBE44\uBC00\uBC88\uD638"), /* @__PURE__ */ React.createElement("input", { type: "password", value: loginPassword, onChange: (e) => setLoginPassword(e.target.value), className: "w-full rounded-xl border px-3 py-2 outline-none " + (darkMode ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-white") })),
      /* @__PURE__ */ React.createElement("button", { type: "submit", disabled: authWorking, className: "w-full rounded-xl px-3 py-2 text-[12px] font-semibold " + (authWorking ? "bg-slate-400" : "bg-orange-500 hover:bg-orange-600 text-white") }, authWorking ? "\uCC98\uB9AC \uC911..." : "\uB85C\uADF8\uC778")
    ), loginTab === "signup" && /* @__PURE__ */ React.createElement(
      "form",
      {
        className: "space-y-3 text-[12px]",
        onSubmit: async (e) => {
          e.preventDefault();
          setAuthError("");
          if (!signupEmail || !signupPassword || !signupNickname || !signupRealname) {
            setAuthError("\uC774\uBA54\uC77C, \uBE44\uBC00\uBC88\uD638, \uB2C9\uB124\uC784, \uC774\uB984\uC740 \uD544\uC218\uC785\uB2C8\uB2E4.");
            return;
          }
          setAuthWorking(true);
          try {
            const r = await apiSignup({
              email: signupEmail,
              password: signupPassword,
              nickname: signupNickname,
              realname: signupRealname,
              gender: signupGender
            });
            if (r && r.result === "ok") {
              await refreshAuth();
              setShowLogin(false);
            } else {
              setAuthError(r && (r.err || r.msg) ? r.err || r.msg : "\uD68C\uC6D0\uAC00\uC785\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
            }
          } catch (err) {
            setAuthError(err && err.message ? err.message : "\uD68C\uC6D0\uAC00\uC785\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
          } finally {
            setAuthWorking(false);
          }
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] text-slate-500" }, "\uC774\uBA54\uC77C"), /* @__PURE__ */ React.createElement("input", { type: "text", value: signupEmail, onChange: (e) => setSignupEmail(e.target.value), className: "w-full rounded-xl border px-3 py-2 outline-none " + (darkMode ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-white") })), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] text-slate-500" }, "\uBE44\uBC00\uBC88\uD638"), /* @__PURE__ */ React.createElement("input", { type: "password", value: signupPassword, onChange: (e) => setSignupPassword(e.target.value), className: "w-full rounded-xl border px-3 py-2 outline-none " + (darkMode ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-white") })), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] text-slate-500" }, "\uB2C9\uB124\uC784"), /* @__PURE__ */ React.createElement("input", { type: "text", value: signupNickname, onChange: (e) => setSignupNickname(e.target.value), className: "w-full rounded-xl border px-3 py-2 outline-none " + (darkMode ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-white") })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] text-slate-500" }, "\uC774\uB984"), /* @__PURE__ */ React.createElement("input", { type: "text", value: signupRealname, onChange: (e) => setSignupRealname(e.target.value), className: "w-full rounded-xl border px-3 py-2 outline-none " + (darkMode ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-white") })), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] text-slate-500" }, "\uC131\uBCC4"), /* @__PURE__ */ React.createElement("select", { value: signupGender, onChange: (e) => setSignupGender(e.target.value), className: "w-full rounded-xl border px-3 py-2 outline-none " + (darkMode ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-white") }, /* @__PURE__ */ React.createElement("option", { value: "\uB0A8\uC790" }, "\uB0A8\uC790"), /* @__PURE__ */ React.createElement("option", { value: "\uC5EC\uC790" }, "\uC5EC\uC790"))))),
      /* @__PURE__ */ React.createElement("button", { type: "submit", disabled: authWorking, className: "w-full rounded-xl px-3 py-2 text-[12px] font-semibold " + (authWorking ? "bg-slate-400" : "bg-orange-500 hover:bg-orange-600 text-white") }, authWorking ? "\uCC98\uB9AC \uC911..." : "\uD68C\uC6D0\uAC00\uC785")
    ), loginTab === "forgot" && /* @__PURE__ */ React.createElement("div", { className: "space-y-3 text-[12px]" }, forgotStep === 1 && /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-400" }, "\uAC00\uC785\uD55C \uC774\uBA54\uC77C\uB85C \uC778\uC99D\uCF54\uB4DC\uB97C \uBC1C\uC1A1\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] text-slate-500" }, "\uC774\uBA54\uC77C"), /* @__PURE__ */ React.createElement("input", { type: "text", value: forgotEmail, onChange: (e) => setForgotEmail(e.target.value), className: "w-full rounded-xl border px-3 py-2 outline-none " + (darkMode ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-white") })), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        disabled: authWorking,
        onClick: async () => {
          setAuthError("");
          if (!forgotEmail) {
            setAuthError("\uC774\uBA54\uC77C\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
            return;
          }
          setAuthWorking(true);
          try {
            const r = await apiSendAuthEmail(forgotEmail);
            if (r && r.result === "ok") {
              setForgotStep(2);
            } else {
              setAuthError(r && (r.err || r.msg) ? r.err || r.msg : "\uBA54\uC77C \uBC1C\uC1A1\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
            }
          } catch (err) {
            setAuthError(err && err.message ? err.message : "\uBA54\uC77C \uBC1C\uC1A1\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
          } finally {
            setAuthWorking(false);
          }
        },
        className: "w-full rounded-xl px-3 py-2 text-[12px] font-semibold " + (authWorking ? "bg-slate-400" : "bg-orange-500 hover:bg-orange-600 text-white")
      },
      authWorking ? "\uBC1C\uC1A1 \uC911..." : "\uC778\uC99D\uCF54\uB4DC \uBC1C\uC1A1"
    )), forgotStep === 2 && /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-400" }, "\uBA54\uC77C\uB85C \uBC1B\uC740 \uC778\uC99D\uCF54\uB4DC\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694."), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] text-slate-500" }, "\uC778\uC99D\uCF54\uB4DC"), /* @__PURE__ */ React.createElement("input", { type: "text", value: forgotCode, onChange: (e) => setForgotCode(e.target.value), className: "w-full rounded-xl border px-3 py-2 outline-none " + (darkMode ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-white") })), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        disabled: authWorking,
        onClick: async () => {
          setAuthError("");
          if (!forgotCode) {
            setAuthError("\uC778\uC99D\uCF54\uB4DC\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.");
            return;
          }
          setAuthWorking(true);
          try {
            const r = await apiCheckAuthCode(forgotCode);
            if (r && r.result === "ok")
              setForgotStep(3);
            else
              setAuthError(r && (r.err || r.msg) ? r.err || r.msg : "\uC778\uC99D\uCF54\uB4DC \uD655\uC778\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
          } catch (err) {
            setAuthError(err && err.message ? err.message : "\uC778\uC99D\uCF54\uB4DC \uD655\uC778\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
          } finally {
            setAuthWorking(false);
          }
        },
        className: "w-full rounded-xl px-3 py-2 text-[12px] font-semibold " + (authWorking ? "bg-slate-400" : "bg-orange-500 hover:bg-orange-600 text-white")
      },
      authWorking ? "\uD655\uC778 \uC911..." : "\uC778\uC99D\uCF54\uB4DC \uD655\uC778"
    ), /* @__PURE__ */ React.createElement("button", { type: "button", className: "w-full rounded-xl border px-3 py-2", onClick: () => setForgotStep(1) }, "\uC774\uBA54\uC77C \uB2E4\uC2DC \uC785\uB825")), forgotStep === 3 && /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-400" }, "\uC0C8 \uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694."), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] text-slate-500" }, "\uC0C8 \uBE44\uBC00\uBC88\uD638"), /* @__PURE__ */ React.createElement("input", { type: "password", value: forgotNewPw, onChange: (e) => setForgotNewPw(e.target.value), className: "w-full rounded-xl border px-3 py-2 outline-none " + (darkMode ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-white") })), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        disabled: authWorking,
        onClick: async () => {
          setAuthError("");
          if (!forgotEmail || !forgotNewPw) {
            setAuthError("\uC774\uBA54\uC77C\uACFC \uC0C8 \uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.");
            return;
          }
          setAuthWorking(true);
          try {
            const r = await apiPasswordChange(forgotEmail, forgotNewPw);
            if (r && r.result === "ok") {
              setAuthError("");
              setLoginTab("signin");
              setForgotStep(1);
            } else {
              setAuthError(r && (r.err || r.msg) ? r.err || r.msg : "\uBE44\uBC00\uBC88\uD638 \uBCC0\uACBD\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
            }
          } catch (err) {
            setAuthError(err && err.message ? err.message : "\uBE44\uBC00\uBC88\uD638 \uBCC0\uACBD\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
          } finally {
            setAuthWorking(false);
          }
        },
        className: "w-full rounded-xl px-3 py-2 text-[12px] font-semibold " + (authWorking ? "bg-slate-400" : "bg-orange-500 hover:bg-orange-600 text-white")
      },
      authWorking ? "\uBCC0\uACBD \uC911..." : "\uBE44\uBC00\uBC88\uD638 \uBCC0\uACBD"
    ))))
  ), showOverlay && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80" }, /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-sm rounded-2xl border border-orange-500/50 bg-slate-950 px-6 py-4 text-sm text-orange-100 shadow-2xl" }, /* @__PURE__ */ React.createElement("div", { className: "mb-2 flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "h-7 w-7 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" }), /* @__PURE__ */ React.createElement("div", { className: "font-semibold" }, "Starting Web-R Notebook...")), /* @__PURE__ */ React.createElement("pre", { className: "whitespace-pre-wrap text-[11px] text-orange-200/80" }, overlayText))));
}
const rootNode = document.getElementById("root");
if (rootNode) {
  const root = ReactDOM.createRoot(rootNode);
  root.render(/* @__PURE__ */ React.createElement(Notebook, null));
}
