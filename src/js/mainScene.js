let scene = new THREE.Scene();
let clock = new THREE.Clock();
let renderer = new THREE.WebGLRenderer();
let imageLoader = new THREE.ImageLoader();
let modelLoader = new THREE.FBXLoader();

let stats, container, mixer, light, controls, camera;

let cubeCamera, pivot1, Ball1;

init();
loadModels();
animate();

function init() {
    initCameras();
    initLight();
    initBackground();
    initOrbitControls();

    container = document.createElement('div');
    document.body.appendChild(container);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    stats = new Stats();
    container.appendChild(stats.dom);
}

function loadModels() {
    // loadCat();
    loadBottle();
    loadSamba();

}

function animate() {
    requestAnimationFrame(animate);
    let delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    cubeCamera.update(renderer, scene);

    renderer.render(scene, camera);

    stats.update();
}


function initLight() {
    light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 200, 0);
    scene.add(light);

    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 200, 100);
    light.castShadow = true;
    light.shadow.camera.top = 180;
    light.shadow.camera.bottom = -100;
    light.shadow.camera.left = -120;
    light.shadow.camera.right = 120;
    scene.add(light);
}

function initCameras() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(100, 200, 300);

    //for bottle reflection
    cubeCamera = new THREE.CubeCamera(1, 1000, 128);
}

function initBackground() {
    scene.background = new THREE.Color(0xa0a0a0);

    let mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), new THREE.MeshPhongMaterial({color: 0x999999, depthWrite: false}));
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    let grid = new THREE.GridHelper(2000, 100, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);
}

function initOrbitControls() {
    controls = new THREE.OrbitControls(camera);
    controls.target.set(0, 100, 0);
    controls.update();
}

function loadCat() {
    let catTexture = new THREE.Texture();
    imageLoader.load('textures/Joven_AlbedoTransparency.png', (image) => {
        catTexture.image = image;
        catTexture.needsUpdate = true;
    });

    modelLoader.load('models/Joven_Animations.fbx', (model) => {
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.recieveShadow = true;
                child.material.map = catTexture;
                child.material.needsUpdate = true;
            }
        });
        model.position.z = -63;

        mixer = new THREE.AnimationMixer(model);
        let action = mixer.clipAction(model.animations[0]);
        action.play();

        scene.add(model);

    });
}

function loadBottle() {
    let glassMaterial = new THREE.MeshPhongMaterial({
        shininess: 100,
        color: 0xffffff,
        specular: 0xffffff,
        envMap: cubeCamera.renderTarget.texture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        refractionRatio: 0.98,
        reflectivity: 0.9
    });

    let stickerTexture = new THREE.Texture();
    imageLoader.load('textures/BottleSticker.png', (image) => {
        stickerTexture.image = image;
        stickerTexture.needsUpdate = true;
    });

    modelLoader.load('models/Bottle.fbx', (model) => {
        model.traverse((child) => {
                if (child.isMesh) {
                    child.name === 'StickerNew' ? child.material.map = stickerTexture : child.material = glassMaterial;
                    child.castShadow = true;
                    child.recieveShadow = true;
                    child.material.needsUpdate = true;
                }
            }
        );

        let scaleVector = new THREE.Vector3(8, 8, 8);
        let scale = Object.assign({}, scaleVector);
        model.scale.set(scale.x, scale.y, scale.z);
        model.rotation.y = 0;
        model.add(cubeCamera);

        scene.add(model);
    });
}

function loadSamba() {
    modelLoader.load('models/Samba Dancing.fbx', (model) => {
        model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.recieveShadow = true;
                    child.material.needsUpdate = true;
                }
            }
        );
        model.position.z = +120;
        model.rotation.y = Math.PI;
        // model.scale.setScalar();

        mixer = new THREE.AnimationMixer(model);
        let action = mixer.clipAction(model.animations[0]);
        action.play();

        scene.add(model);
    });
}
