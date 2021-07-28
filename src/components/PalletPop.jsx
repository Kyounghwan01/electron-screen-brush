import { useState, useContext, useEffect } from "react";
import { ImageContext } from "../context";
import styled from "styled-components";

const PalletPop = ({ hideModal }) => {
  const { data, setImageData, setPlatteColor } = useContext(ImageContext);
  const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 });
  const [platte, setPlatte] = useState([]);
  const [selectColorIndex, setSelectColorIndex] = useState(0);

  useEffect(() => {
    setPlatte(setPlatteColor());
    setRgb(data.platte[0]);
  }, []);

  useEffect(() => {
    if (!platte.length) return;
    const rgbArray = Object.values(rgb);
    setPlatte(
      platte.map((color, index) =>
        selectColorIndex === index
          ? `rgb(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]})`
          : color
      )
    );
  }, [rgb]);

  const presetChangeColor = index => {
    const rgbrr = platte[index]
      .replace(/^(rgb|rgba)\(/, "")
      .replace(/\)$/, "")
      .replace(/\s/g, "")
      .split(",");

    let rgbObject = {};
    rgbrr.forEach((color, i) => {
      rgbObject = {
        ...rgbObject,
        [i === 0 ? "r" : i === 1 ? "g" : "b"]: Number(color)
      };
    });

    setSelectColorIndex(index);
    setRgb(rgbObject);
  };

  const initColor = () => {
    setPlatte(setPlatteColor(true));
    setSelectColorIndex(0);
    setRgb({ r: 44, g: 44, b: 44 });
  };

  const saveColor = () => {
    const setColorArrayToObject = platte.map(color => {
      const colorArray = color
        .replace(/^(rgb|rgba)\(/, "")
        .replace(/\)$/, "")
        .replace(/\s/g, "")
        .split(",");

      let rgbObject = {};
      colorArray.forEach((color, i) => {
        rgbObject = {
          ...rgbObject,
          [i === 0 ? "r" : i === 1 ? "g" : "b"]: Number(color)
        };
      });
      return rgbObject;
    });

    setImageData({ platte: setColorArrayToObject });
  };

  return (
    <PalltePopBlock rgb={rgb}>
      <div className="modals">
        <div className="modals__container">
          <h4>Brush Custom Color</h4>
          <CloseBtn>
            <span className="close" title="close" onClick={hideModal}>
              &times;
            </span>
          </CloseBtn>
          <div className="modals__container__pallet">
            {platte.map((color, index) => (
              <div
                key={index}
                className="modals__container__pallet__color"
                style={{ backgroundColor: color }}
                onClick={() => presetChangeColor(index)}
              />
            ))}
          </div>
          <div className="modals__container__rgb-box">
            <div className="modals__container__rgb-box__box" />
            {["r", "g", "b"].map(type => (
              <input
                key={type}
                type="number"
                value={rgb[type]}
                onChange={e =>
                  setRgb({ ...rgb, [type]: Number(e.currentTarget.value) })
                }
              />
            ))}
          </div>

          <button className="btn btn-primary mr-2" onClick={saveColor}>
            save
          </button>

          <button className="btn btn-primary mr-2" onClick={initColor}>
            reset
          </button>
        </div>
      </div>
    </PalltePopBlock>
  );
};

const PalltePopBlock = styled.div`
  .modals {
    position: absolute;
    background: rgba(0, 0, 0, 0.6);
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
    &__container {
      position: relative;
      height: 500px;
      width: 700px;
      border-radius: 16px;
      background: white;
      padding: 25px;
      &__rgb-box {
        &__box {
          width: 30px;
          height: 30px;
          background: ${props =>
            `rgb(${props.rgb.r}, ${props.rgb.g}, ${props.rgb.b})`};
        }
      }

      &__pallet {
        display: flex;
        &__color {
          width: 50px;
          height: 50px;
          box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11),
            0 1px 3px rgba(0, 0, 0, 0.08);
          border-radius: 25px;
          cursor: pointer;
          margin: 10px 0 0 10px;
        }
      }
    }
  }
`;

const CloseBtn = styled.div`
  position: absolute;
  right: 25px;
  top: 10px;
  &:hover {
    cursor: pointer;
  }
  .close {
    font-size: 25px;
  }
`;
export default PalletPop;
