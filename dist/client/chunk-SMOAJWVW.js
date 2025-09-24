var s=class{static uploadFileInForm(a){return`
<div class="dropzone-previews mt-3" id="file-previews">
    <div class="card mt-1 mb-0 shadow-none border dz-processing dz-success dz-complete">
        <div class="p-2">
            <div class="row align-items-center">
                <div class="col-auto">
                    <img data-dz-thumbnail src="img/svg/excel-file-type.svg" class="avatar-sm rounded" alt="">
                </div>
                <div class="col ps-0">
                    <a href="javascript:void(0);" class="text-muted fw-bold" data-dz-name>${a.name}</a>
                    <p class="mb-0" data-dz-size><strong>${(a.size/1024/1024).toFixed(2)}</strong> MB</p>
                </div>
                <div class="col-auto">
                    <!-- Button -->
                    <a href="#" class="btn btn-link btn-lg text-muted" data-dz-remove>
                        <i class="dripicons-cross"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>`}};export{s as a};
//# sourceMappingURL=chunk-SMOAJWVW.js.map
