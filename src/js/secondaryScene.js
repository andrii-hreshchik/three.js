var container, stats;

var camera, scene, renderer;

var mesh, geometry, ballMaterial, texture;
var Ball1, Ball2, Ball3;
var pivot1, pivot2, pivot3;

var cubeCamera1;
var cubeCamera2;
var cubeCamera3;
var carGlassMaterial;

var sunLight, ambientLight;

var clock = new THREE.Clock();
let imageLoader = new THREE.ImageLoader();
let modelLoader = new THREE.FBXLoader();
let texture2;

init();
loadSamba();
loadBottle();
animate();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 2, 10000);
    camera.position.set(300, 300, 300);

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x00aaff, 1000, 10000);

    cubeCamera1 = new THREE.CubeCamera(10, 1000, 128);

    var texture = new THREE.Texture(document.getElementById('texture'));
    imageLoader.load('textures/BottleSticker.png', (image) => {
        texture.image = image;
        texture.minFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
    });

    var groundMaterial = new THREE.MeshPhongMaterial({
        shininess: 80,
        color: 0xffffff,
        specular: 0xffffff,
        map: texture,
        receiveShadow: true
    });

    var planeGeometry = new THREE.PlaneBufferGeometry(100, 100);

    var ground = new THREE.Mesh(planeGeometry, groundMaterial);
    //ground.position.set(0, 0, 0);
    ground.rotation.x = -Math.PI / 2;
    ground.scale.set(20, 20, 20);
    scene.add(ground);

    pivot1 = new THREE.Object3D();
    scene.add(pivot1);

    texture2 = new THREE.Texture();
    imageLoader.load('textures/FFFFFF-0.6.png', (image) => {
        texture2.image = image;
        texture2.needsUpdate = true;
    });

    ballMaterial = new THREE.MeshPhongMaterial({
        shininess: 100,
        color: 0xffffff,
        specular: 0xffffff,
        envMap: cubeCamera1.renderTarget.texture,
        transparent: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        refractionRatio: 0.98,
        reflectivity: 0.9
    });

    carGlassMaterial = new THREE.MeshStandardMaterial({
        // color: 0xffffff,
        envMap: cubeCamera1.renderTarget.texture,
        map: texture2,
        metalness: 1,
        roughness: 0,
        opacity: 0.8,
        // transparent: true,
       premultipliedAlpha: true,
    });

    geometry = new THREE.SphereGeometry(100, 16, 16);
    Ball1 = new THREE.Mesh(geometry, ballMaterial);
    Ball1.position.set(100, 100, 0);
    Ball1.castShadow = true;
    Ball1.receiveShadow = true;
    //  Ball1.add(cubeCamera1);
    //  pivot1.add(Ball1);

    ambientLight = new THREE.AmbientLight(0x3f2806);
    scene.add(ambientLight);

    pointLight = new THREE.PointLight(0xffaa00, 1, 5000);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    sunLight = new THREE.SpotLight(0xffffff, 0.3, 0, Math.PI / 2);
    sunLight.position.set(1000, 2000, 1000);
    sunLight.castShadow = true;
    sunLight.shadow.bias = -0.0002;
    sunLight.shadow.camera.far = 4000;
    sunLight.shadow.camera.near = 750;
    sunLight.shadow.camera.fov = 30;
    scene.add(sunLight);

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    //renderer.setClearColor(0xffffff);
    renderer.setClearColor(scene.fog.color);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    //renderer.shadowMap.enabled = true;
    //renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    //renderer.gammaInput = true;
    //renderer.gammaOutput = true;
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.rotateSpeed = 4.0;
    controls.zoomSpeed = 2.0;
    controls.panSpeed = 1.0;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.5;
    controls.keys = [65, 83, 68];

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize(event) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.handleResize();
}

function animate() {
    requestAnimationFrame(animate);
    var delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    pivot1.rotateY(0.1 * delta);
    Ball1.rotateY(-0.1 * delta);
    controls.update();
    render();
}

function render() {
    cubeCamera1.update(renderer, scene);
    renderer.render(scene, camera);
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
        model.position.z = +200;
        model.rotation.y = Math.PI;
        // model.scale.setScalar();

        mixer = new THREE.AnimationMixer(model);
        let action = mixer.clipAction(model.animations[0]);
        action.play();

        scene.add(model);
    });
}

function loadBottle() {
    let bottleTexture = new THREE.Texture();
    imageLoader.load('textures/BottleSticker.png', (image) => {
        bottleTexture.image = image;
        bottleTexture.needsUpdate = true;
    });

    modelLoader.load('models/Bottle.fbx', (model) => {
        model.traverse((child) => {
                if (child.isMesh) {
                    child.name === 'StickerNew' ? child.material.map = bottleTexture : child.material = carGlassMaterial;
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
        model.add(cubeCamera1);

        pivot1.add(model);

        //scene.add(model);
    });
}
