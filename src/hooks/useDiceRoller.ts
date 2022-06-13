import { Dice } from 'models/Dice'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setError } from 'store/errorSlice'
import useProducts from 'models/store/useProducts'
import { useStoreContract } from 'contracts/contracts'
import Otto from 'models/Otto'
import { useEthers } from '@usedapp/core'
import Product from 'models/store/Product'
import { connectContractToSigner } from '@usedapp/core/dist/esm/src/hooks'
import { useTranslation } from 'react-i18next'
import { selectOttoInTheHell } from 'store/uiSlice'
import useApi from './useApi'

export enum State {
  Intro = 1,
  Processing = 2,
  FirstResult = 3,
  SecondResult = 4,
}

export interface DiceRoller {
  state: State
  dice?: Dice
  product?: Product
  rollTheDice: () => void
  answerQuestion: (index: number, answer: number) => void
  nextEvent: () => void
  reset: () => void
  loading: boolean
}

const useHellDiceProduct = () => {
  const { products } = useProducts()
  return products.find(product => product?.type === 'helldice')
}

const useUnfinishDice = (ottoId?: string) => {
  const ottoInTheHell = useSelector(selectOttoInTheHell)
  const api = useApi()
  const { i18n } = useTranslation()
  const [diceList, setDiceList] = useState<Dice[]>([])
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!ottoId) {
      return
    }
    api
      .getAllDice(ottoId, i18n.resolvedLanguage)
      .then(diceList => setDiceList(diceList))
      .catch(err => dispatch(setError(err)))
      .then(() => setLoading(true))
  }, [api, ottoId, i18n.resolvedLanguage, ottoInTheHell])

  return {
    loading,
    unfinishDice: diceList.find(dice => dice.events.find(event => !event.effects)),
  }
}

export const useDiceRoller = (otto?: Otto): DiceRoller => {
  const api = useApi()
  const dispatch = useDispatch()
  const { loading, unfinishDice } = useUnfinishDice(otto?.tokenId)
  const [state, setState] = useState(State.Intro)
  const [dice, setDice] = useState<Dice>()
  const { account } = useEthers()
  const product = useHellDiceProduct()
  const store = useStoreContract()
  const { library } = useEthers()
  const { i18n } = useTranslation()

  useEffect(() => {
    if (unfinishDice) {
      setDice(unfinishDice)
      setState(State.FirstResult)
    }
  }, [unfinishDice, api])

  const rollTheDice = useCallback(async () => {
    if (!otto || !account || !product || !library) {
      return
    }

    try {
      setState(State.Processing)
      const tx = await connectContractToSigner(store, {}, library).buyNoChainlink(account, product?.id, 1)
      await tx.wait()
      setDice(await api.rollTheDice(otto.tokenId, tx.hash, i18n.resolvedLanguage))
      setState(State.FirstResult)
    } catch (err) {
      setState(State.Intro)
      dispatch(setError(err as any))
    }
  }, [otto, account, product, library])

  const answerQuestion = useCallback(
    (index: number, answer: number) => {
      if (!dice || !otto) {
        return
      }
      api
        .answerDiceQuestion(otto.tokenId, dice.tx, index, answer, i18n.resolvedLanguage)
        .then(setDice)
        .catch(err => dispatch(setError(err)))
    },
    [dice, otto]
  )

  const nextEvent = useCallback(() => {
    setState(State.SecondResult)
  }, [])

  const reset = useCallback(() => {
    setDice(undefined)
    setState(State.Intro)
  }, [])

  return {
    state,
    dice,
    rollTheDice,
    answerQuestion,
    nextEvent,
    reset,
    product,
    loading,
  }
}
