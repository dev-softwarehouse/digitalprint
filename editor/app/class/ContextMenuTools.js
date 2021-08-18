export default class ContextMenuTools {
    static initShadowBoxTool(_this, setShadowColor, changeDropSettings, changeShadowBlur, changeOffsetX, changeOffsetY) {
        const offsetRange = 50;
        const object = _this.proposedPositionInstance ? _this.proposedPositionInstance : (_this.textInstance ? _this.textInstance : null);
        const Editor = object.editor;
        const elem = document.createElement('div');
        elem.className = 'toolBoxExtend';

        const globalSettings = document.createElement('div');
        globalSettings.className = 'toolBoxExtendSection';

        const title = document.createElement('div');
        title.className = 'title';
        title.innerHTML = 'Włącz cień:';

        const singleElem = document.createElement('div');
        singleElem.className = 'button singleElem active';

        const singleElemImage = new Image();
        singleElemImage.src = 'images/1zdjecie-on.svg';

        singleElem.appendChild(singleElemImage);

        const allElemInPage = document.createElement('div');
        allElemInPage.className = 'button allElemInPage';

        const allElemInPageImage = new Image();
        allElemInPageImage.src = "images/1strona-on.svg";

        allElemInPage.appendChild(allElemInPageImage);

        const allElemInProject = document.createElement('div');
        allElemInProject.className = 'button allElemInProject';

        const allElemInProjectImage = new Image();
        allElemInProjectImage.src = 'images/strony-on.svg';

        allElemInProject.appendChild(allElemInProjectImage);

        const info = document.createElement('div');
        info.className = 'buttonsSettingsInfo';
        info.innerHTML = 'Dla aktualnego zdjęcia';

        const onOffLabel = document.createElement('label');
        const onOff = document.createElement('input');
        onOff.type = 'checkbox';
        onOff.className = 'switch';
        onOff.checked = object._dropShadow;

        const onOffdispl = document.createElement('div');

        onOffLabel.appendChild(onOff);
        onOffLabel.appendChild(onOffdispl);

        globalSettings.appendChild(title);
        globalSettings.appendChild(onOffLabel);
        globalSettings.appendChild(singleElem);
        globalSettings.appendChild(allElemInPage);
        globalSettings.appendChild(allElemInProject);
        globalSettings.appendChild(info);

        const valuesSettings = document.createElement('div');
        valuesSettings.className = 'toolBoxExtendSection';


        const shadowBlurLabel = document.createElement('label');
        shadowBlurLabel.className = 'shadowToolsClass inputRight';
        shadowBlurLabel.innerHTML = "Rozmycie cienia:";

        const shadowBlurInputUser = document.createElement("input");
        shadowBlurInputUser.className = 'spinner';
        shadowBlurInputUser.value = object.shadowBlur;
        shadowBlurLabel.appendChild(shadowBlurInputUser);


        const shadowOffsetXLabel = document.createElement('label');
        shadowOffsetXLabel.className = 'shadowToolsClass inputRight';
        shadowOffsetXLabel.innerHTML = "Przesunięcie X:";

        const shadowOffsetXInputUser = document.createElement("input");
        shadowOffsetXInputUser.className = 'spinner';
        shadowOffsetXInputUser.value = object.shadowOffsetX;
        shadowOffsetXLabel.appendChild(shadowOffsetXInputUser);


        const shadowOffsetYLabel = document.createElement('label');
        shadowOffsetYLabel.className = 'shadowToolsClass inputRight';
        shadowOffsetYLabel.innerHTML = "Przesunięcie Y:";

        const shadowOffsetYInputUser = document.createElement("input");
        shadowOffsetYInputUser.className = 'spinner';
        shadowOffsetYInputUser.value = object.shadowOffsetY;
        shadowOffsetYLabel.appendChild(shadowOffsetYInputUser);


        const shadowColorPicker = document.createElement('div');
        shadowColorPicker.className = 'borderColorPicker';
        //borderColorPickerLabel.innerHTML = "K:";

        const shadowColorPickerLabel = document.createElement('h4');
        shadowColorPickerLabel.className = 'borderColorPickerLabel';
        //borderColorPickerLabel.innerHTML = "K:";

        const shadowColor = document.createElement('input');
        shadowColor.id = 'borderColor';
        shadowColor.className = 'spinner cp-full';

        shadowColorPicker.appendChild(shadowColorPickerLabel);
        shadowColorPickerLabel.appendChild(shadowColor);

        $(shadowColor).colorpicker({

            parts: 'full',
            showOn: 'both',
            buttonColorize: true,
            showNoneButton: true,
            alpha: true,
            color: '#FF0000',
            stop: function (e) {

                setShadowColor(e.target.value, true, singleElem, allElemInPage, allElemInProject);

            },
            select: function (e) {

                setShadowColor(e.target.value, false, singleElem, allElemInPage, allElemInProject);

            },

            colorFormat: 'RGBA'

        });

        var leftCol = document.createElement('div');
        leftCol.className = 'col-2';

        var rightCol = document.createElement('div');
        rightCol.className = 'col-2';

        valuesSettings.appendChild(leftCol);
        valuesSettings.appendChild(rightCol);

        rightCol.appendChild(shadowColorPicker);
        rightCol.appendChild(shadowBlurLabel);
        leftCol.appendChild(shadowOffsetXLabel);
        leftCol.appendChild(shadowOffsetYLabel);

        elem.appendChild(globalSettings);
        elem.appendChild(valuesSettings);

        _this.currentExtendedTool = elem;
        _this.openSection = 'shadow';


        onOff.addEventListener('change', function (e) {

            changeDropSettings(e.target.checked, singleElem, allElemInPage, allElemInProject)

        });

        singleElem.addEventListener('click', function (e) {

            e.stopPropagation();

            if (!$(_this).hasClass('active')) {

                $(allElemInPage).removeClass('active');
                $(allElemInProject).removeClass('active');
                $(singleElem).addClass('active');
                info.innerHTML = 'Dla aktualnego zdjęcia';
            }

        });

        allElemInPage.addEventListener('click', function (e) {

            e.stopPropagation();

            if (!$(_this).hasClass('active')) {

                $(singleElem).removeClass('active');
                $(allElemInProject).removeClass('active');
                $(allElemInPage).addClass('active');
                info.innerHTML = 'Dla wszystkich zdjęć na stronie';

            }

        });

        allElemInProject.addEventListener('click', function (e) {

            e.stopPropagation();

            if (!$(_this).hasClass('active')) {

                $(allElemInPage).removeClass('active');
                $(singleElem).removeClass('active');
                $(allElemInProject).addClass('active');
                info.innerHTML = 'Dla wszystkich zdjęć w projekcie';

            }

        });

        $(shadowBlurInputUser).spinner({

            min: 0,

            spin: function (event) {

                changeShadowBlur(parseInt(event.target.value), false, singleElem, allElemInPage, allElemInProject);

            },
            change: function (event) {

                changeShadowBlur(parseInt(event.target.value), true, singleElem, allElemInPage, allElemInProject);

            },

            stop: function (event) {

                changeShadowBlur(parseInt(event.target.value), true, singleElem, allElemInPage, allElemInProject);

            }

        }).val(object.shadowBlur);

        $(shadowOffsetXInputUser).spinner({

            min: -offsetRange,
            max: offsetRange,

            spin: function (event) {

                changeOffsetX(parseInt(event.target.value), false, singleElem, allElemInPage, allElemInProject);

            },
            change: function (event) {

                changeOffsetX(parseInt(event.target.value), true, singleElem, allElemInPage, allElemInProject);

            },

            stop: function (event) {

                changeOffsetX(parseInt(event.target.value), true, singleElem, allElemInPage, allElemInProject);

            }

        }).val(object.shadowOffsetX);


        $(shadowOffsetYInputUser).spinner({

            min: -offsetRange,
            max: offsetRange,

            spin: function (event) {

                changeOffsetY(parseInt(event.target.value), false, singleElem, allElemInPage, allElemInProject);

            },
            change: function (event) {

                changeOffsetY(parseInt(event.target.value), true, singleElem, allElemInPage, allElemInProject);

            },

            stop: function (event) {

                changeOffsetY(parseInt(event.target.value), true, singleElem, allElemInPage, allElemInProject);

            }

        }).val(object.shadowOffsetY);

        return elem;

    }

    static createSpinner({element, val, min, max, onUpdate, onFinish}) {
        const conf = {
            spin: function (event,ui) {
                onUpdate(ui.value);
            },
            stop: function (event) {
                onFinish($(this).spinner('value'));
            }
        }
        if (min)
            conf.min = min;
        if (max)
            conf.max = max;
        $(element).spinner(conf).val(val);
    }
}