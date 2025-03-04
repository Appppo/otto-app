import { useEthers } from '@usedapp/core'
import { useTranslation } from 'next-i18next'
import styled from 'styled-components'
import { Caption, ContentExtraSmall } from 'styles/typography'
import walletImage from './wallet.png'

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 10px;
  border: 3px ${({ theme }) => theme.colors.lightGray400} solid;
  padding: 12px 20px 12px;
  box-sizing: border-box;

  &:hover {
    background: ${({ theme }) => theme.colors.lightGray100};
  }

  &::before {
    flex: 0;
    content: '';
    display: block;
    min-width: 24px;
    max-width: 24px;
    height: 24px;
    background: center / cover url(${walletImage.src});
  }
`

const StyledInfo = styled.div`
  display: flex;
  flex-direction: column;
`

const StyledDisconnectButtoon = styled(Caption).attrs({ as: 'button' })`
  color: ${({ theme }) => theme.colors.darkGray100};
`

export default function Account() {
  const { account } = useEthers()
  const { t } = useTranslation('', { keyPrefix: 'side_menu' })

  const address = `${account!.slice(0, 3)}...${account!.slice(account!.length - 3, account!.length)}`

  return (
    <StyledContainer>
      <StyledInfo>
        <ContentExtraSmall>{address}</ContentExtraSmall>
        <ContentExtraSmall>Polygon</ContentExtraSmall>
      </StyledInfo>
      <StyledDisconnectButtoon>{t('disconnect')}</StyledDisconnectButtoon>
    </StyledContainer>
  )
}
