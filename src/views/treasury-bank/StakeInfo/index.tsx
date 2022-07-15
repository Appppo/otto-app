import CLAMCoin from 'assets/icons/CLAM.svg'
import USDPlus from 'assets/icons/usdplus.png'
import PearlBalance from 'assets/icons/pearl-balance.png'
import TreasurySection from 'components/TreasurySection'
import { useClamPrice } from 'contracts/views'
import {
  useTotalStakedAmount,
  usePearlBankBalance,
  useClamPerPearl,
  useStakedInfo,
  useTotalRewardsAmount,
  useNextRewadTime,
  useClaimableRewards,
} from 'contracts/functions'
import formatDistance from 'date-fns/formatDistanceStrict'
import { ethers, utils, BigNumber } from 'ethers'
import { trim } from 'helpers/trim'
import { useBreakPoints } from 'hooks/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { useMemo } from 'react'
import styled from 'styled-components'
import { ContentSmall, Note } from 'styles/typography'
import StakeDialog from '../StakeDialog'
import BadgeLeft from './badge-left.svg'
import BadgeRight from './badge-right.svg'
import GashaponTicketEn from './gashapon-ticket-en.jpg'
import GashaponTicketZh from './gashapon-ticket-zh.jpg'

const StyledStakeInfo = styled.div`
  width: 420px;

  @media ${({ theme }) => theme.breakpoints.mobile} {
    width: 100%;
  }
`

const StyledBody = styled.div`
  margin-top: 138px;
  margin-bottom: 78px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  @media ${({ theme }) => theme.breakpoints.mobile} {
    margin-top: 46vw;
    margin-bottom: 85px;
    padding: 15px;
  }
`

const StyledTVL = styled(ContentSmall).attrs({ as: 'div' })`
  text-align: center;
  position: absolute;
  padding: 6px 24px;
  background: ${({ theme }) => theme.colors.white};
  border: 4px solid ${({ theme }) => theme.colors.darkBrown};
  top: 54px;

  @media ${({ theme }) => theme.breakpoints.mobile} {
    top: 30vw;
  }

  &:before {
    content: '';
    position: absolute;
    background: center / auto 28px url(${BadgeLeft.src});
    background-position: left center;
    width: 12px;
    height: 28px;
    top: 50%;
    left: -14px;
    transform: translateY(-14px);
  }

  &:after {
    content: '';
    position: absolute;
    background: center / auto 28px url(${BadgeRight.src});
    background-position: right center;
    width: 12px;
    height: 28px;
    top: 50%;
    right: -14px;
    transform: translateY(-14px);
  }
`

const StyledSection = styled(TreasurySection).attrs({ showRope: false })`
  width: 280px;
  background: ${({ theme }) => theme.colors.lightGray200};
  display: flex;
  flex-direction: column;
  align-items: center;

  @media ${({ theme }) => theme.breakpoints.mobile} {
    width: 100%;
  }
`

const StyledSectionTitle = styled(ContentSmall).attrs({ as: 'h2' })`
  width: 100%;
  background: ${({ theme }) => theme.colors.darkBrown};
  color: ${({ theme }) => theme.colors.white};
  text-align: center;
  padding: 6px 0;
`

const StyledSectionBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding: 10px 12px 14px 12px;
`

const StyledClamBalanceContainer = styled.div`
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.colors.otterBlack};
  padding: 6px 20px;
`

const StyledClamBalance = styled(ContentSmall)`
  display: flex;
  align-items: center;
  flex: 1;
  &:before {
    content: '';
    /* display: block; */
    background: no-repeat center/contain url(${CLAMCoin.src});
    width: 22px;
    height: 22px;
    margin-right: 5px;
  }
`

const StyledUsdPlusBalance = styled(ContentSmall)`
  display: flex;
  align-items: center;
  flex: 1;
  &:before {
    content: '';
    /* display: block; */
    background: no-repeat center/contain url(${USDPlus.src});
    width: 22px;
    height: 22px;
    margin-right: 5px;
  }
`

const StyledInfos = styled.div``

const StyledInfoContainer = styled(Note).attrs({ as: 'div' })`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const StyledInfoTitle = styled.p<{ icon?: string }>`
  display: flex;
  align-items: center;
  &:before {
    content: '';
    display: ${({ icon }) => (icon ? 'block' : 'none')};
    background: no-repeat center/contain url(${({ icon }) => icon});
    width: 20px;
    height: 20px;
    margin-right: 5px;
  }
`

const StyledHint = styled(Note).attrs({ as: 'p' })`
  color: ${({ theme }) => theme.colors.darkGray100};
`

const StyledSubtitle = styled(Note).attrs({ as: 'p' })``

const StyledExtraRewards = styled(Note).attrs({ as: 'p' })`
  text-align: center;
`

const StyledGashaponTicket = styled.img`
  width: 100%;
  border-radius: 10px;
  border: 2px solid ${({ theme }) => theme.colors.otterBlack};
`

const StyledStakedDialog = styled(StakeDialog)`
  width: 100%;
  margin-top: -20px;
`

interface Props {
  className?: string
}

export default function StakeInfo({ className }: Props) {
  const { t, i18n } = useTranslation('', { keyPrefix: 'bank' })
  const { isMobile } = useBreakPoints()
  const clamPrice = useClamPrice()
  const totalStaked = useTotalStakedAmount()
  const pearlBankBalance = usePearlBankBalance()
  const clamPerPearl = useClamPerPearl()
  const totalRewards = useTotalRewardsAmount()
  const myStakedInfo = useStakedInfo()
  const nextRewardTime = useNextRewadTime()
  const claimableRewards = useClaimableRewards()
  const tvl = clamPrice ? clamPrice.mul(totalStaked) : BigNumber.from(0)

  const countdown = useMemo(() => {
    return formatDistance(new Date(), nextRewardTime.toNumber() * 1000)
  }, [nextRewardTime])

  const myRewards = useMemo(() => {
    if (totalStaked.eq(0)) {
      return BigNumber.from(0)
    }
    return totalRewards.mul(myStakedInfo.amount).div(totalStaked)
  }, [myStakedInfo, totalStaked, totalRewards])

  const yieldRate = useMemo(() => {
    if (myRewards.eq(0)) {
      return BigNumber.from(0)
    }
    return myStakedInfo.amount.mul(clamPrice).div(myRewards)
  }, [myStakedInfo, clamPrice, myRewards])

  return (
    <StyledStakeInfo className={className}>
      <StyledBody>
        <StyledTVL>
          {t('tvl')}
          <br />${trim(ethers.utils.formatUnits(tvl, 9), 2)}
        </StyledTVL>
        {isMobile && <StyledStakedDialog />}
        <StyledSection>
          <StyledSectionTitle>{t('staked_balance')}</StyledSectionTitle>
          <StyledSectionBody>
            <StyledClamBalanceContainer>
              <StyledClamBalance>{trim(ethers.utils.formatEther(totalStaked), 6)} CLAM</StyledClamBalance>
            </StyledClamBalanceContainer>
            <StyledInfos>
              <StyledInfoContainer>
                <StyledInfoTitle icon={PearlBalance.src}>{t('pearl_balance')}</StyledInfoTitle>
                <p>{trim(ethers.utils.formatEther(pearlBankBalance), 9)} PEARL</p>
              </StyledInfoContainer>
              <StyledInfoContainer>
                <p />
                <StyledHint>{`1 PEARL = ${trim(ethers.utils.formatUnits(clamPerPearl, 18), 2)} CLAM`}</StyledHint>
              </StyledInfoContainer>
            </StyledInfos>
          </StyledSectionBody>
        </StyledSection>
        <StyledSection>
          <StyledSectionTitle>
            {t('current_reward')}
            <StyledSubtitle>{t('rebase_countdown', { countdown })}</StyledSubtitle>
          </StyledSectionTitle>
          <StyledSectionBody>
            <StyledClamBalanceContainer>
              <StyledUsdPlusBalance>{trim(utils.formatUnits(claimableRewards, 6), 4)} USD+</StyledUsdPlusBalance>
            </StyledClamBalanceContainer>
            <StyledInfos>
              <StyledInfoContainer>
                <StyledInfoTitle>{t('latest_reward')}</StyledInfoTitle>
                <p>{trim(utils.formatUnits(myRewards, 6), 4)}</p>
              </StyledInfoContainer>
              <StyledInfoContainer>
                <StyledInfoTitle>{t('latest_reward_yield')}</StyledInfoTitle>
                <p>{trim(utils.formatUnits(yieldRate.mul(100), 6), 4)}%</p>
              </StyledInfoContainer>
              <StyledInfoContainer>
                <StyledInfoTitle>{t('apr')}</StyledInfoTitle>
                <p>{trim(utils.formatUnits(yieldRate.mul(365).mul(100), 6), 4)}%</p>
              </StyledInfoContainer>
              {/* <StyledInfoContainer>
                <p />
                <StyledPearlChestContainer>
                  <StyledPearlChest>
                    {t('chest_reward')}
                    <span>+ 86%</span>
                  </StyledPearlChest>
                </StyledPearlChestContainer>
              </StyledInfoContainer> */}
            </StyledInfos>
            <StyledExtraRewards>{t('extra_rewards')}</StyledExtraRewards>
            <StyledGashaponTicket
              src={i18n.resolvedLanguage === 'zh-tw' ? GashaponTicketZh.src : GashaponTicketEn.src}
            />
          </StyledSectionBody>
        </StyledSection>
      </StyledBody>
    </StyledStakeInfo>
  )
}
