window.FormEngin=class{static uploadFileInForm(s){return`
<div class="dropzone-previews mt-3" id="file-previews">
    <div class="card mt-1 mb-0 shadow-none border dz-processing dz-success dz-complete">
        <div class="p-2">
            <div class="row align-items-center">
                <div class="col-auto">
                    <img data-dz-thumbnail src="img/svg/excel-file-type.svg" class="avatar-sm rounded" alt="">
                </div>
                <div class="col ps-0">
                    <a href="javascript:void(0);" class="text-muted fw-bold" data-dz-name>${s.name}</a>
                    <p class="mb-0" data-dz-size><strong>${(s.size/1024/1024).toFixed(2)}</strong> MB</p>
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
</div>`}};
//# sourceMappingURL=chunk-2KAXEM3K.js.map
