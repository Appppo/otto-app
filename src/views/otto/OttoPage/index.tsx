import dynamic from 'next/dynamic'
import { useQuery } from '@apollo/client'
import OpenSeaBlue from 'assets/opensea-blue.svg'
import Button from 'components/Button'
import Loading from 'components/Loading'
import { getOpenSeaLink, reserveOttoAmount } from 'constant'
import { format } from 'date-fns'
import useOtto from 'hooks/useOtto'
import { useMemo } from 'react'
import { useTranslation } from 'next-i18next'
import ReactMarkdown from 'react-markdown'
import styled from 'styled-components/macro'
import { Caption, ContentLarge, ContentSmall, Display3, Headline, Note } from 'styles/typography'
import RankingIcon from 'assets/ranking.png'
import ClassicIcon from 'assets/badge/classic.png'
import LegendaryIcon from 'assets/badge/legendary.png'
import FirstGenIcon from 'assets/badge/first-gen.png'
import Constellations from 'assets/constellations'
import { DiceBanner } from 'components/DiceBanner'
import { useRouter } from 'next/router'
import { GET_OTTO } from 'graphs/otto'
import { GetOtto, GetOttoVariables } from 'graphs/__generated__/GetOtto'
import { useEthers } from '@usedapp/core'
import PlayIcon from './icons/play-voice.svg'
import OttoTraitDetails from './OttoTraitDetails'
import TheOtter from './icons/the_otter.png'

const DicePopup = dynamic(() => import('components/DicePopup'), {
  ssr: false,
})

const StyledOttoPage = styled.div`
  min-height: 100%;
  background: white;
  padding: 30px;
  color: ${({ theme }) => theme.colors.otterBlack};

  @media ${({ theme }) => theme.breakpoints.mobile} {
    padding: 20px;
  }
`

const StyledOttoContainer = styled.div`
  display: flex;
  gap: 30px;

  @media ${({ theme }) => theme.breakpoints.mobile} {
    flex-direction: column;
    align-items: center;
  }
`

const StyledLeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`

const StyledOttoImage = styled.img`
  position: sticky;
  top: 30px;
  width: 440px;
  min-width: 440px;
  height: 440px;
  border: 4px solid ${({ theme }) => theme.colors.otterBlack};
  background: url(/otto-loading.jpg);
  background-size: 100% 100%;

  @media ${({ theme }) => theme.breakpoints.mobile} {
    width: 100%;
    min-width: unset;
    height: unset;
    position: unset;
  }
`

const StyledPlayButton = styled(Button)`
  position: sticky;
  top: 490px;
  @media ${({ theme }) => theme.breakpoints.mobile} {
    position: unset;
  }
`

const StyledPlayButtonText = styled(Headline)`
  display: flex;
  align-items: center;

  &:before {
    content: '';
    background-image: url(${PlayIcon.src});
    background-size: contain;
    background-repeat: no-repeat;
    width: 20px;
    height: 20px;
    margin-right: 10px;
    display: block;
  }
`

const StyledContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
`

const StyledOpenSeaLink = styled.a`
  display: flex;
  color: ${({ theme }) => theme.colors.otterBlack};

  &:before {
    content: '';
    background-image: url(${OpenSeaBlue.src});
    background-size: contain;
    background-repeat: no-repeat;
    width: 21px;
    height: 21px;
    margin-right: 10px;
    display: block;
  }
`

const StyledName = styled.div``

const StyledRarityScore = styled.div``

const StyledDescription = styled.div``

const StyledInfos = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
`

const StyledInfo = styled.div<{ icon: string }>`
  display: flex;
  &:before {
    content: '';
    display: block;
    margin-right: 12px;
    background-image: url(${({ icon }) => icon});
    background-size: contain;
    background-repeat: no-repeat;
    width: 30px;
    height: 30px;
  }
`

const StyledAttrs = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 118px);
  column-gap: 20px;
`

const StyledAttr = styled.div`
  display: flex;
  justify-content: space-between;
`

const StyledStatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;

  @media ${({ theme }) => theme.breakpoints.mobile} {
    display: flex;
    flex-direction: column;
  }
`

const StyledStat = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  align-items: center;
  border: 2px solid ${({ theme }) => theme.colors.otterBlack};
  border-radius: 15px;
  background: ${({ theme }) => theme.colors.lightGray100};
  padding: 20px;
`

const StyledStatIcon = styled.img`
  width: 49px;
`

const StyledStatTitle = styled(ContentSmall).attrs({ as: 'p' })``

const StyledStatDesc = styled(Note).attrs({ as: 'p' })`
  color: ${({ theme }) => theme.colors.darkGray100};
  text-align: center;
`

const StyledLegendaryBoost = styled(Note).attrs({ as: 'p' })`
  text-align: center;
  white-space: pre;
  color: ${({ theme }) => theme.colors.clamPink};
`

const StyledRarityContainer = styled(Headline).attrs({ as: 'div' })`
  display: flex;
  gap: 20px;

  @media ${({ theme }) => theme.breakpoints.mobile} {
    flex-direction: column;
    align-items: flex-start;
  }
`

const StyledRanking = styled(Headline).attrs({
  as: 'div',
})`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  &:before {
    content: '';
    width: 24px;
    height: 24px;
    background-image: url(${RankingIcon.src});
    background-size: 100%;
  }
`

const StyledBoostBox = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 20px;
  background: ${({ theme }) => theme.colors.lightGray100};
  border: 2px solid ${({ theme }) => theme.colors.lightGray400};
  border-radius: 15px;
  white-space: pre;

  img {
    width: 80px;

    @media ${({ theme }) => theme.breakpoints.mobile} {
      width: 80px;
    }
  }
`

const StyledBoost = styled.span`
  color: ${({ theme }) => theme.colors.clamPink};
  margin-left: 10px;
`

export default function OttoPage() {
  const { t } = useTranslation()
  const { chainId } = useEthers()
  const router = useRouter()
  const ottoId = router.query.ottoId as string
  const { data } = useQuery<GetOtto, GetOttoVariables>(GET_OTTO, {
    variables: { ottoId },
  })
  const { otto } = useOtto(data?.ottos[0], true)
  const infos = useMemo(
    () =>
      otto
        ? [
            {
              icon: '/trait-icons/Gender.png',
              text: t('otto.gender', { gender: otto.gender }),
            },
            {
              icon: '/trait-icons/Personality.png',
              text: t('otto.personality', { personality: otto.personality }),
            },
            {
              icon: '/trait-icons/Birthday.png',
              text: t('otto.birthday', { birthday: format(otto.birthday, 'MMM dd, yyyy') }),
            },
            {
              icon: '/trait-icons/Voice.png',
              text: t('otto.voice', { voice: otto.voiceName }),
            },
            {
              icon: Constellations[otto.zodiacSign],
              text: t('otto.zodiac_sign', { constellation: otto.zodiacSign }),
            },
          ]
        : null,
    [otto, t]
  )

  return (
    <>
      <StyledOttoPage>
        <StyledOttoContainer>
          <StyledLeftContainer>
            <StyledOttoImage src={otto?.largeImage} />
            <StyledPlayButton
              primaryColor="white"
              Typography={StyledPlayButtonText}
              disableSound
              onClick={() => otto?.playVoice()}
            >
              {t('otto.play_voice')}
            </StyledPlayButton>
          </StyledLeftContainer>
          <StyledContentContainer>
            <StyledOpenSeaLink href={getOpenSeaLink(ottoId)} target="_blank">
              <Caption>{t('otto.opensea_link')}</Caption>
            </StyledOpenSeaLink>
            <StyledName>
              {!otto ? <Loading width="320px" height="54px" /> : <Display3>{otto.name}</Display3>}
            </StyledName>
            <StyledRarityScore>
              {!otto ? (
                <Loading width="260px" height="36px" />
              ) : (
                <StyledRarityContainer>
                  {t('otto.rarity_score', {
                    score: otto.totalRarityScore,
                    brs: otto.baseRarityScore,
                    rrs: otto.relativeRarityScore,
                  })}
                  <StyledRanking>{otto.ranking}</StyledRanking>
                </StyledRarityContainer>
              )}
            </StyledRarityScore>
            <StyledInfos>
              {infos?.map(({ icon, text }, index) => (
                <StyledInfo key={index} icon={icon}>
                  <ContentLarge>{text}</ContentLarge>
                </StyledInfo>
              ))}
            </StyledInfos>

            {otto && (otto.zodiacBoost || 0) > 0 && (
              <StyledBoostBox>
                <img src={TheOtter.src} alt="the Otter" />
                <ContentSmall>
                  {t(otto?.isChosenOne ? 'otto.chosen_one' : 'otto.constellation_boost', {
                    birthday: format(otto.birthday, 'MMM d'),
                    constellation: otto.zodiacSign,
                  })}
                  <StyledBoost>BRS+{otto.zodiacBoost}!</StyledBoost>
                </ContentSmall>
              </StyledBoostBox>
            )}

            {otto && <DiceBanner otto={otto} />}

            <StyledDescription>
              {!otto ? (
                <Loading width="100%" height="260px" />
              ) : (
                <ContentSmall>
                  <ReactMarkdown>{otto.description}</ReactMarkdown>
                </ContentSmall>
              )}
            </StyledDescription>

            <StyledAttrs>
              {otto?.displayAttrs.map(({ trait_type, value }, index) => (
                <StyledAttr key={index}>
                  <ContentLarge>{trait_type}</ContentLarge>
                  <ContentLarge>{value}</ContentLarge>
                </StyledAttr>
              ))}
            </StyledAttrs>

            {otto && (
              <>
                <StyledStatsContainer>
                  <StyledStat>
                    <StyledStatIcon src={otto.legendary ? LegendaryIcon.src : ClassicIcon.src} />
                    <StyledStatTitle>{t(otto.legendary ? 'otto.legendary' : 'otto.classic')}</StyledStatTitle>
                    <StyledStatDesc>{t(otto.legendary ? 'otto.legendary_note' : 'otto.classic_note')}</StyledStatDesc>
                    {Number(otto.tokenId) >= reserveOttoAmount(chainId) && otto.legendary && (
                      <StyledLegendaryBoost>
                        {t('otto.legendary_boost', {
                          context: (otto.raw.legendaryBoost || 0) > 0 ? 'added' : 'removed',
                        })}
                      </StyledLegendaryBoost>
                    )}
                  </StyledStat>
                  <StyledStat>
                    <StyledStatIcon src={`/arms/${otto.armsImage}.png`} />
                    <StyledStatTitle>{otto.coatOfArms}</StyledStatTitle>
                    <StyledStatDesc>{t('otto.coatOfArms', { arms: otto.coatOfArms })}</StyledStatDesc>
                  </StyledStat>
                  <StyledStat>
                    <StyledStatIcon src={FirstGenIcon.src} />
                    <StyledStatTitle>{t('otto.first_gen')}</StyledStatTitle>
                    <StyledStatDesc>{t('otto.first_gen_desc')}</StyledStatDesc>
                  </StyledStat>
                </StyledStatsContainer>
                <OttoTraitDetails otto={otto} />
              </>
            )}
          </StyledContentContainer>
        </StyledOttoContainer>
      </StyledOttoPage>
      <DicePopup />
    </>
  )
}
