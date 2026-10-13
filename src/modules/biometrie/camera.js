/* module: biometrie/camera.js — PNDDRR engine (classic globals) */
/* Capture photo : choix de la caméra (USB / intégrée) + import fichier */
const CAM_LS_KEY = "pnddrr_camera_id";
var _photoStreams = {};

function photoCaptureSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

function compressPhotoImage(img, maxPx) {
  const MAX = maxPx || 300;
  const k = Math.min(1, MAX / Math.max(img.width, img.height, 1));
  const cv = document.createElement("canvas");
  cv.width = Math.max(1, Math.round(img.width * k));
  cv.height = Math.max(1, Math.round(img.height * k));
  cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
  const out = cv.toDataURL("image/jpeg", 0.82);
  return out && out.length > 50 ? out : null;
}

function compressPhotoDataUrl(src, maxPx, onDone) {
  const img = new Image();
  img.onload = () => {
    try {
      onDone(compressPhotoImage(img, maxPx) || src);
    } catch (e) {
      onDone(src);
    }
  };
  img.onerror = () => onDone(src);
  img.src = src;
}

function photoFromFile(file, maxPx, onDone) {
  if (!file) {
    if (onDone) onDone(null);
    return;
  }
  const r = new FileReader();
  r.onload = () => compressPhotoDataUrl(r.result, maxPx, onDone);
  r.onerror = () => {
    toast("Impossible de lire le fichier image.");
    if (onDone) onDone(null);
  };
  r.readAsDataURL(file);
}

function photoCaptureStop(boxId) {
  const st = _photoStreams[boxId];
  if (st) {
    st.getTracks().forEach((t) => t.stop());
    delete _photoStreams[boxId];
  }
  const root = $(boxId);
  if (root && root._vidEl) {
    root._vidEl.srcObject = null;
    root._vidEl.style.display = "none";
  }
}

function photoCaptureStopAll() {
  Object.keys(_photoStreams).forEach(photoCaptureStop);
}

function savedCameraId() {
  try {
    return localStorage.getItem(CAM_LS_KEY) || "";
  } catch (e) {
    return "";
  }
}

function saveCameraId(id) {
  try {
    if (id) localStorage.setItem(CAM_LS_KEY, id);
    else localStorage.removeItem(CAM_LS_KEY);
  } catch (e) {}
}

async function listVideoCameras() {
  if (!photoCaptureSupported()) return [];
  let list = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "videoinput");
  if (list.length && list.every((d) => !d.label)) {
    try {
      const tmp = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      tmp.getTracks().forEach((t) => t.stop());
      list = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "videoinput");
    } catch (e) {
      /* permission refusée — liste sans libellés */
    }
  }
  return list;
}

function cameraLabel(d, i) {
  if (d.label) return d.label;
  return "Caméra " + (i + 1);
}

async function photoCaptureStart(boxId) {
  const root = $(boxId);
  if (!root || !root._sel) return;
  if (!photoCaptureSupported()) {
    toast("La capture directe n'est pas disponible dans ce navigateur — utilisez « Importer un fichier ».");
    return;
  }
  photoCaptureStop(boxId);
  const deviceId = root._sel.value;
  if (deviceId) saveCameraId(deviceId);
  const video = root._vidEl;
  const constraints = {
    audio: false,
    video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: "environment" },
  };
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    _photoStreams[boxId] = stream;
    video.srcObject = stream;
    video.style.display = "block";
    root._previewBox.style.display = "none";
    await video.play();
  } catch (e) {
    toast("Accès à la caméra refusé ou appareil indisponible. Vérifiez les permissions du navigateur.");
  }
}

function photoCaptureSnap(boxId) {
  const root = $(boxId);
  if (!root || !root._vidEl) return;
  const video = root._vidEl;
  const stream = _photoStreams[boxId];
  if (!stream || !video.videoWidth) {
    toast("Activez d'abord la caméra, puis capturez.");
    return;
  }
  const maxPx = root._maxPx || 300;
  const cv = document.createElement("canvas");
  cv.width = video.videoWidth;
  cv.height = video.videoHeight;
  cv.getContext("2d").drawImage(video, 0, 0);
  const raw = cv.toDataURL("image/jpeg", 0.88);
  photoCaptureStop(boxId);
  compressPhotoDataUrl(raw, maxPx, (out) => {
    root.setPhoto(out);
    toast("Photo capturée.");
  });
}

function uiPhotoCapture(boxId, initialPhoto, opts) {
  const root = $(boxId);
  if (!root) return;
  opts = opts || {};
  const maxPx = opts.maxPx || 300;
  const onChange = opts.onChange || null;

  photoCaptureStop(boxId);

  root.className = "photo-capture-wrap";
  root._maxPx = maxPx;
  root._photo = initialPhoto || null;

  root.innerHTML = `
    <div class="photo-box photo-capture-preview" data-role="preview">${root._photo ? `<img src="${root._photo}">` : "Photo"}</div>
    <video class="photo-capture-video" playsinline muted autoplay style="display:none"></video>
    ${
      photoCaptureSupported()
        ? `<div class="field photo-capture-dev" style="margin-top:10px;text-align:left">
      <label>Appareil photo</label>
      <select class="photo-capture-select" style="font-size:13px"><option value="">— Chargement… —</option></select>
      <div class="small muted" style="margin-top:4px;font-weight:400;text-transform:none">Branchez la webcam USB, choisissez-la dans la liste, puis « Activer la caméra ».</div>
    </div>
    <div class="photo-capture-actions" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:10px">
      <button type="button" class="btn sm sec photo-cap-start">Activer la caméra</button>
      <button type="button" class="btn sm photo-cap-snap">Capturer</button>
      <button type="button" class="btn sm ghost photo-cap-retake" style="display:${root._photo ? "inline-block" : "none"}">Reprendre</button>
    </div>`
        : `<p class="small muted" style="margin-top:8px">Capture directe indisponible — importez une photo.</p>`
    }
    <label class="btn sm ghost" style="margin-top:8px;display:inline-block;cursor:pointer">Importer un fichier
      <input type="file" accept="image/*" class="photo-cap-file" style="display:none"></label>
    <div class="small muted" style="margin-top:6px">Compression automatique (≈${maxPx} px).</div>`;

  root._previewBox = root.querySelector('[data-role="preview"]');
  root._vidEl = root.querySelector(".photo-capture-video");
  root._sel = root.querySelector(".photo-capture-select");

  root.setPhoto = function (dataUrl) {
    root._photo = dataUrl || null;
    if (dataUrl) {
      root._previewBox.innerHTML = `<img src="${dataUrl}">`;
      root._previewBox.style.display = "flex";
      const rt = root.querySelector(".photo-cap-retake");
      if (rt) rt.style.display = "inline-block";
    } else {
      root._previewBox.innerHTML = "Photo";
      root._previewBox.style.display = "flex";
      const rt = root.querySelector(".photo-cap-retake");
      if (rt) rt.style.display = "none";
    }
    if (onChange) onChange(root._photo);
  };

  root.getPhoto = () => root._photo || null;

  const fileIn = root.querySelector(".photo-cap-file");
  if (fileIn) {
    fileIn.addEventListener("change", (e) => {
      const f = e.target.files[0];
      photoFromFile(f, maxPx, (out) => {
        if (out) root.setPhoto(out);
        e.target.value = "";
      });
    });
  }

  const btnStart = root.querySelector(".photo-cap-start");
  if (btnStart) btnStart.addEventListener("click", (e) => { e.preventDefault(); photoCaptureStart(boxId); });
  const btnSnap = root.querySelector(".photo-cap-snap");
  if (btnSnap) btnSnap.addEventListener("click", (e) => { e.preventDefault(); photoCaptureSnap(boxId); });
  const btnRetake = root.querySelector(".photo-cap-retake");
  if (btnRetake) {
    btnRetake.addEventListener("click", (e) => {
      e.preventDefault();
      root.setPhoto(null);
      photoCaptureStart(boxId);
    });
  }

  if (root._sel) {
    listVideoCameras().then((cams) => {
      if (!root._sel) return;
      const saved = savedCameraId();
      if (!cams.length) {
        root._sel.innerHTML = `<option value="">Aucune caméra détectée</option>`;
        return;
      }
      root._sel.innerHTML = cams
        .map((d, i) => {
          const sel = saved && d.deviceId === saved ? " selected" : !saved && i === 0 ? " selected" : "";
          return `<option value="${esc(d.deviceId)}"${sel}>${esc(cameraLabel(d, i))}</option>`;
        })
        .join("");
      root._sel.addEventListener("change", () => {
        saveCameraId(root._sel.value);
        if (_photoStreams[boxId]) photoCaptureStart(boxId);
      });
    });
  }
}
