import { useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Props {
  children: React.ReactNode;
  snapPoint?: string;
}

export function ModalSheet({ children, snapPoint = '88%' }: Props) {
  const router = useRouter();
  const c = useThemeColors();
  const sheetRef = useRef<BottomSheet>(null);

  const handleClose = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, [router]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.55}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={[snapPoint]}
      enablePanDownToClose
      onClose={handleClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: c.background }}
      handleIndicatorStyle={{ backgroundColor: c.border, width: 40, height: 4 }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize">
      <BottomSheetView style={{ flex: 1 }}>{children}</BottomSheetView>
    </BottomSheet>
  );
}
