import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useDispatch, useSelector} from 'react-redux';
import {AutoCreditConsts, CreditTarget, MortgageConsts, STEP_FEE} from '../../const';
import {getCostOfPercent, getPercentOfCost, getValidValue, getWordForm, getWordFormWithValue} from '../../utils';
import {InputCheckbox} from '../input-checkbox/input-checkbox';
import {InputWithButtons} from '../input-with-buttons/input-with-buttons';
import {Range} from '../range/range';
import {
    changeCost,
    changeFee,
    changePeriod,
    changeUseCapital, changeUseComprehensiveCover, changeUseInsurance
} from '../../store/actions';

const CalculatorInputs = ({className}) => {
    const dispatch = useDispatch();
    const cost = useSelector(state => state.cost);
    const fee = useSelector(state => state.fee);
    const period = useSelector(state => state.period);
    const useCapital = useSelector(state => state.useCapital);
    const useComprehensiveCover = useSelector(state => state.useComprehensiveCover);
    const useInsurance = useSelector(state => state.useInsurance);
    const isAutoCredit = useSelector(state => state.target === CreditTarget.AUTO_CREDIT);
    const minCost = isAutoCredit ? AutoCreditConsts.MIN_COST : MortgageConsts.MIN_COST;
    const maxCost = isAutoCredit ? AutoCreditConsts.MAX_COST : MortgageConsts.MAX_COST;
    const minFee = isAutoCredit ? AutoCreditConsts.MIN_FEE : MortgageConsts.MIN_FEE;
    const maxFee = isAutoCredit ? AutoCreditConsts.MAX_FEE : MortgageConsts.MAX_FEE;
    const minPeriod = isAutoCredit ? AutoCreditConsts.MIN_PERIOD : MortgageConsts.MIN_PERIOD;
    const maxPeriod = isAutoCredit ? AutoCreditConsts.MAX_PERIOD : MortgageConsts.MAX_PERIOD;
    const stepCost = isAutoCredit ? AutoCreditConsts.STEP_COST : MortgageConsts.STEP_COST;
    const minCredit = isAutoCredit ? AutoCreditConsts.MIN_CREDIT : MortgageConsts.MIN_CREDIT;
    const maxFeeCost = cost - minCredit - MortgageConsts.PARENT_CAPITAL *
        (useCapital && !isAutoCredit);

    const [percent, setPercent] = useState(minFee);
    const [errorCost, setErrorCost] = useState(false);

    const onCostChange = (value) => {
        const validCost = Number.parseFloat(value);
        onCostValidate(validCost);

        if (isFinite(validCost)) {
            dispatch(changeCost(validCost));
        }
        setPercent(minFee);
        if (isFinite(Number.parseFloat(value)) && value > minCost && value < maxCost) {
            dispatch(changeFee(getCostOfPercent(minFee, value)));
        } else {
            dispatch(changeFee(getCostOfPercent(minFee, minCost)));
        }
    };

    const onCostValidate = (value) => {
        if (!isFinite(Number.parseFloat(value)) || value < minCost || value > maxCost) {
            setErrorCost(true);
        } else {
            setErrorCost(false);
        }
    };

    const onFeeChange = (value) => {
        dispatch(changeFee(value));
        setPercent(getPercentOfCost(value, cost) || minFee);
    };

    const onFeeValidate = () => {
        const validFee = getValidValue(fee, getCostOfPercent(minFee, cost), maxFeeCost);
        dispatch(changeFee(validFee));
        setPercent(getPercentOfCost(validFee, cost) || minFee);
    };

    const onPeriodChange = (value) => {
        dispatch(changePeriod(value));
    };

    const onPeriodValidate = () => {
        dispatch(changePeriod(getValidValue(period, minPeriod, maxPeriod)));
    };

    const onUseCapitalClick = (value) => {
        dispatch(changeUseCapital(value));
    };

    const onUseInsurance = (value) => {
        dispatch(changeUseInsurance(value));
    };

    const onUseComprehensiveCover = (value) => {
        dispatch(changeUseComprehensiveCover(value));
    };

    return (
        <section className={`${className} calculator-inputs`}>
            <h3 className="calculator-inputs__parameter">?????? 2. ?????????????? ?????????????????? ??????????????</h3>
            <div className="calculator-inputs__subtitle">
                <InputWithButtons className={`calculator-inputs__price ${errorCost && 'input--error'}`}
                                  value={cost}
                                  min={minCost}
                                  max={maxCost}
                                  mask={getWordForm(cost, [' ??????????', ' ??????????', ' ????????????'])}
                                  step={stepCost}
                                  onChange={(value) => onCostChange(value)}
                                  type="string"
                                  label={`?????????????????? ${isAutoCredit ? '????????????????????' : '????????????????????????'}`}
                                  desc={`${errorCost ? '?????????????? ?????????? ????' : '????'} ${minCost.toLocaleString()} ???? ${maxCost.toLocaleString()} ????????????`}/>

                <Range onChangeInput={(value) => onFeeChange(value)}
                       onChangeRange={(evt) => onFeeChange(getCostOfPercent(evt.target.value, cost))}
                       onBlur={() => onFeeValidate()}
                       className="calculator-inputs__range"
                       range={percent}
                       value={fee}
                       mask={getWordForm(fee, ['??????????', '??????????', '????????????'])}
                       min={minFee}
                       max={maxFee}
                       step={STEP_FEE}
                       label="???????????????????????????? ??????????"
                       desc={`${percent > maxFee ? maxFee : percent}%`}/>

                <Range onChangeInput={(value) => onPeriodChange(Number(value))}
                       onChangeRange={(evt) => onPeriodChange(Number(evt.target.value))}
                       onBlur={() => onPeriodValidate()}
                       className="calculator-inputs__range"
                       value={Number(period)}
                       range={period}
                       min={minPeriod}
                       max={maxPeriod}
                       mask={getWordForm(period, ['??????', '????????', '??????'])}
                       label="???????? ????????????????????????"
                       desc={<><span>{getWordFormWithValue(minPeriod, ['??????', '????????', '??????'])}</span><span>{getWordFormWithValue(maxPeriod, ['??????', '????????', '??????'])}</span></>}/>

                {isAutoCredit
                    ? <>
                        <InputCheckbox className="calculator-inputs__comprehensive-cover" label="???????????????? ?????????? ?? ?????????? ??????????" value={useComprehensiveCover} onChange={(value) => onUseComprehensiveCover(value)}/>
                        <InputCheckbox className="calculator-inputs__insurance" label="???????????????? ?????????????????????? ?????????? ?? ?????????? ??????????" value={useInsurance} onChange={(value) => onUseInsurance(value)}/>
                    </>
                    : <InputCheckbox className="calculator-inputs__capital" label="???????????????????????? ?????????????????????? ??????????????" value={useCapital} onChange={(value) => onUseCapitalClick(value)}/>
                }
            </div>
        </section>
    );
};

CalculatorInputs.propTypes = {
    className: PropTypes.string.isRequired
};

export {CalculatorInputs};
